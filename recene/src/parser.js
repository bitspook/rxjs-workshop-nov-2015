import jsYaml from 'js-yaml';

export function parseFilename({config, filename}) {
    let date,
        slug;

    date = filename.split('-').slice(0, 3).join('-');
    slug = filename.split('-').slice(3).join('-').split('.')[0];

    return {
        config: Object.assign({}, config, {date, slug}),
        filename,
    };
}

export function parseContent({config, content}) {
    let markdown,
        re,
        results,
        yaml;

    re = /^(-{3}(?:\n|\r)([\w\W]+?)(?:\n|\r)-{3})?([\w\W]*)*/;
    results = re.exec(content);

    yaml = results[2];
    markdown = results[3] || '';

    return {
        config: Object.assign({}, config, jsYaml.load(yaml)),
        content: markdown.trim(),
    };
}
