const fs = require('fs')

module.exports = async () => {
    const showNames = {
        greys: 'Grey\'s Anatomy',
        scrubs: 'Scrubs',
        er: 'ER',
        house: 'House',
    }
    const shows = ['greys', 'scrubs', 'er', 'house']
    const showData = {}

    shows.forEach(show => {
        showData[show] = JSON.parse(fs.readFileSync(`./_data/${show}.json`))
    })

    const mappings = shows.flatMap(
        (v, i) => shows.slice(i+1).map( w => v + '-' + w )
    )

    const data = {}

    mappings.forEach(m => {
        const [showOne, showTwo] = m.split('-')

        const intersection = Object.keys(showData[showOne]).filter(element => Object.keys(showData[showTwo]).includes(element))

        data[m] = {
            names: {
                showOne: showNames[showOne],
                showTwo: showNames[showTwo],
            },
            keys: {
                showOne,
                showTwo,
            },
            data: intersection.map(id => {
                return {
                    actor: showData[showOne][id],
                    showOne: showData[showOne][id].roles,
                    showTwo: showData[showTwo][id].roles,
                }
            }).sort((a,b) => {
                const countA = a.showOne[0].episode_count + a.showTwo[0].episode_count
                const countB = b.showOne[0].episode_count + b.showTwo[0].episode_count
                return (countA > countB) ? -1 : ((countB > countA) ? 1 : 0)
            }).map(e => {
                if (e.showOne[0].character.startsWith('Dr.') && e.showTwo[0].character.startsWith('Dr.')) {
                    e.doubleDoctor = true
                }

                return e
            })
        }
    })

    return {
        names: showNames,
        keys: Object.keys(data),
        ...data,
    }
}