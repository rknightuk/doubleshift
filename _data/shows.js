const fs = require('fs')

module.exports = async () => {
    const showNames = {
        greys: 'Grey\'s Anatomy',
        scrubs: 'Scrubs',
        er: 'ER',
        house: 'House',
        gooddoctor: 'The Good Doctor',
        resident: 'The Resident',
        chicagomed: 'Chicago Med',
        chicagohope: 'Chicago Hope',
    }
    const shows = Object.keys(showNames)
    const options = Object.keys(showNames).map(o => {
        return { name: showNames[o], value: o }
    })
    const showData = {}
    const stats = {
        episodes: 0,
        seasons: 0,
    }
    let actorIds = []

    shows.forEach(show => {
        const json = JSON.parse(fs.readFileSync(`./_data/${show}.json`))
        showData[show] = json.cast
        stats.episodes += json.stats.episodes
        stats.seasons += json.stats.seasons
        actorIds = actorIds.concat(Object.keys(showData[show]))
    })

    actorIds = [...new Set(actorIds)]
    let leaderboard = []

    actorIds.forEach(aid => {
        const actor = {
            id: aid,
            showCount: 0,
            episodeCount: 0,
            roles: [],
        }

        shows.forEach(show => {
            if (showData[show][aid]) {
                actor.data = showData[show][aid]
                actor.showCount++
                actor.episodeCount += showData[show][aid].roles[0].episode_count
                actor.roles.push({
                    show: showNames[show],
                    ...showData[show][aid].roles[0],
                })
            }
        })

        leaderboard.push(actor)
    })

    leaderboard = leaderboard.filter(a => a.showCount > 1)
    const leaderboardShows = [...leaderboard]
    const leaderboardEpisodes = [...leaderboard]
    const leaderboardScore = [...leaderboard]
    leaderboardShows.sort((a, b) => {
        if (a.showCount > b.showCount) return -1;
	    if (a.showCount < b.showCount) return 1;
        if (a.episodeCount < b.episodeCount) return 1;
	    if (a.episodeCount > b.episodeCount) return -1;
    })
    leaderboardEpisodes.sort((a,b) => { return (a.episodeCount > b.episodeCount) ? -1 : ((b.episodeCount > a.episodeCount) ? 1 : 0) })
    leaderboardScore.sort((a,b) => { return ((a.episodeCount * a.showCount) > (b.episodeCount * b.showCount)) ? -1 : (((b.episodeCount * b.showCount) > (a.episodeCount * a.showCount)) ? 1 : 0) })

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
        options,
        stats,
        showCount: shows.length,
        leaderboard: {
            shows: leaderboardShows,
            episodes: leaderboardEpisodes,
            score: leaderboardScore,
        },
        actors: [...new Set(actorIds)].length,
        names: showNames,
        keys: Object.keys(data),
        ...data,
    }
}