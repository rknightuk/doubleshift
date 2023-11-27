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
]

const fetchShow = async (show) => {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${show.id}/aggregate_credits?&series_id=1416&language=en-US`, {
        headers: {
            'Authorization': `Bearer ${process.env.API_KEY}`,
            'accept': 'application/json'
        }
    })

    const json = await res.json()
    const data = {}

    json.cast.forEach((actor) => {
        data[actor.id] = {
            ...actor,
        }
    })

    fs.writeFileSync(`./_data/${show.name}.json`, JSON.stringify(data, '', 2))
}

const run = async () => {
    SHOWS.forEach(async (show) => {
        fetchShow(show)
    })
} 

run()