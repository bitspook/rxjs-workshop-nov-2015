/* eslint-disable no-param-reassign */

import path from 'path';
import marked from 'marked';
import rimraf from 'rimraf';
import mkdirp from 'mkdirp';
import ncp from 'ncp';
import {
    render,
} from 'mustache';
import {
    Observable,
} from 'rx';
import {
    readdir,
    readFile,
    writeFile,
} from 'fs';
import {
    parseFilename,
    parseContent,
} from './parser';

/**
 * - [X] Read the config
 * - [X] List files in the posts dir
 * - [X] Parse post level config from file-name
 * - [X] Read markdown files from posts dir
 * - [X] Parse post level config from markdown files
 * - [X] Convert markdown to HTML
 * - [X] Apply post html to site theme
 * - [X] Delete existing public dir
 * - [X] Recreate empty public dir
 * - [X] Copy theme's CSS over to dest dir
 * - [X] Write final HTML to files
 * - [X] Create index page
 */

let filecontents_,
    filenames_,
    finalIndexHtml_,
    finalPostHtml_,
    globalConfig,
    indexWriteOps_,
    mkdirp_,
    ncp_,
    postWriteOps_,
    postsDir,
    prepOps_,
    publicDir,
    readFile_,
    readdir_,
    rimraf_,
    themeDir,
    themePartials_,
    writeFile_;

globalConfig = require(path.resolve('./config')).default;
postsDir = path.resolve('./_posts');
publicDir = path.resolve('./_public');
themeDir = path.resolve(__dirname, './theme');

mkdirp_ = Observable.fromNodeCallback(mkdirp);
readdir_ = Observable.fromNodeCallback(readdir);
readFile_ = Observable.fromNodeCallback(readFile);
rimraf_ = Observable.fromNodeCallback(rimraf);
writeFile_ = Observable.fromNodeCallback(writeFile);
ncp_ = Observable.fromNodeCallback(ncp);

filenames_ = readdir_(postsDir)
    .flatMap(Observable.fromArray)
    .combineLatest(
        Observable.return(globalConfig),
        (filename, config) => {
            return {
                config,
                filename,
            };
        }
    )
    .map(parseFilename);

filecontents_ = filenames_
    .flatMap(
        ({filename}) => {
            let filepath;

            filepath = path.resolve(postsDir, filename);

            return readFile_(filepath, 'utf-8');
        },
        ({config}, content) => {
            return {
                config,
                content,
            };
        }
    )
    .map(parseContent)
    .map(({config, content}) => {
        return {
            config,
            content: marked(content),
        };
    })
    .share();

themePartials_ = Observable
    .zip(
        readFile_(path.resolve(themeDir, './layouts/header.html'), 'utf-8'),
        readFile_(path.resolve(themeDir, './layouts/footer.html'), 'utf-8'),
        readFile_(path.resolve(themeDir, './layouts/post.html'), 'utf-8'),
        readFile_(path.resolve(themeDir, './layouts/default.html'), 'utf-8'),
        readFile_(path.resolve(themeDir, './layouts/index.html'), 'utf-8'),
        (header, footer, post, defaultLayout, indexLayout) => {
            return {
                header,
                footer,
                defaultLayout,
                post,
                indexLayout,
            };
        }
    );

finalPostHtml_ = filecontents_
    .combineLatest(
        themePartials_,
        ({config, content}, {header, footer, post, defaultLayout}) => {
            header = render(header, config);
            footer = render(footer, config);
            post = render(post, {
                header,
                footer,
                content,
                ...config,
            });

            return {
                config,
                content: render(defaultLayout, {content: post}),
            };
        }
    );

finalIndexHtml_ = filecontents_
    .reduce((acc, {config}) => {
        let postLink;

        postLink = `/${config.category}/${config.slug}.html`;

        return acc.concat([
            {
                link: postLink,
                ...config,
            },
        ]).sort((p1, p2) => {
            let [y1, m1, d1] = p1.date.split('-'),
                [y2, m2, d2] = p2.date.split('-');

            return y1 - y2 || m1 - m2 || d1 - d2;
        });
    }, [])
    .combineLatest(
        themePartials_,
        (posts, {header, footer, indexLayout, defaultLayout}) => {
            header = render(header, globalConfig);
            footer = render(footer, globalConfig);
            indexLayout = render(indexLayout, {
                posts,
                ...globalConfig,
            });

            return {
                config: {},
                content: render(defaultLayout, {content: indexLayout}),
            };
        }
    );

prepOps_ = rimraf_(publicDir)
    .flatMap(() => mkdirp_(publicDir))
    .flatMap(() => ncp_(path.resolve(themeDir, './css'), path.resolve(publicDir, './css')));

postWriteOps_ = prepOps_
    .flatMap(() => finalPostHtml_)
    .flatMap(({config, content}) => {
        let categoryPath,
            filepath;

        categoryPath = path.resolve(publicDir, (config.category || 'uncategorized'));
        filepath = path.resolve(categoryPath, `${config.slug}.html`);

        return mkdirp_(categoryPath)
            .flatMap(() => writeFile_(filepath, content, 'utf-8'));
    });

indexWriteOps_ = prepOps_
    .flatMap(() => finalIndexHtml_)
    .flatMap(({content}) => {
        let indexFilepath;

        indexFilepath = `${publicDir}/index.html`;

        return writeFile_(indexFilepath, content, 'utf-8');
    });

postWriteOps_
    .subscribe(
        () => {},
        (err) => console.error('Error somewhere in the chain', err),
        () => console.log('Done generating the site!')
    );

indexWriteOps_
    .subscribe(
        () => {},
        (err) => console.error('Error while writing index page', err),
        () => console.log('Wrote index page!')
    );
