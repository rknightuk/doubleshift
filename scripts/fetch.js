const fs = require('fs')

const SHOWS = [
    {
        id: 1416,
        name: 'greys',
    },
    {
        id: 4556,
        name: 'scrubs',
    },
    {
        id: 1408,
        name: 'house',
    },
    {
        id: 4588,
        name: 'er',
    },
    {
        id: 71712,
        name: 'gooddoctor',
    },
    {
        id: 74016,
        name: 'resident',
    },
    {
        id: 62650,
        name: 'chicagomed',
    },
    {
        id: 6467,
        name: 'chicagohope',
    }
]

const fetchShow = async (show) => {
    const actors = await fetch(`https://api.themoviedb.org/3/tv/${show.id}/aggregate_credits?&series_id=1416&language=en-US`, {
        headers: {
            'Authorization': `Bearer ${process.env.API_KEY}`,
            'accept': 'application/json'
        }
    })

    const actorJson = await actors.json()
    const data = {}

    actorJson.cast.forEach((actor) => {
        if (actor.known_for_department !== 'Acting') return
        data[actor.id] = {
            ...actor,
        }
    })

    const episodes = await fetch(`https://api.themoviedb.org/3/tv/${show.id}`, {
        headers: {
            'Authorization': `Bearer ${process.env.API_KEY}`,
            'accept': 'application/json'
        }
    })

    const episodesJson = await episodes.json()

    fs.writeFileSync(`./_data/${show.name}.json`, JSON.stringify({
        cast: data,
        stats: {
            episodes: episodesJson.number_of_episodes,
            seasons: episodesJson.number_of_seasons,
        }
    }, '', 2))
}

const run = async () => {
    SHOWS.forEach(async (show) => {
        fetchShow(show)
    })
} 

run()