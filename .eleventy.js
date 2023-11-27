module.exports = function(eleventyConfig) {
    eleventyConfig.addFilter('objectDebug', (value) => {
        return `<pre>${JSON.stringify(value, '', 2)}</pre>`
    })

    eleventyConfig.addPassthroughCopy('assets')
}