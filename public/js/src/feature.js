import {hot} from 'react-hot-loader'
import React, {useState} from 'react'
import ReactDOM from 'react-dom'
import {latestProject, useCredits, useProjects} from "./models";
import {YoutubeIframe} from "./components"

const BannerFadeoutStart = 500
const BannerFadeoutEnd = BannerFadeoutStart + 500

export const Render = (selectors) => {
    const domContainer = document.querySelector(selectors)
    ReactDOM.render(<Feature/>, domContainer)
}

const Feature = (props) => {
    const [projects,] = useProjects()

    const [showBanner, setShowBanner] = useState(true)
    new Promise((resolve) => setTimeout(resolve, BannerFadeoutStart)).then(_ => setShowBanner(false))

    const [drawBanner, setDrawBanner] = useState(true)
    new Promise((resolve) => setTimeout(resolve, BannerFadeoutEnd)).then(_ => setDrawBanner(false))

    const [showCredits, setShowCredits] = useState(false)
    const toggleCredits = () => setShowCredits(!showCredits)

    const latest = latestProject(projects)
    const [credits,] = useCredits(latest)

    if (latest === undefined) return <div/>
    return <div className='container'>
        <div className='row row-cols-1'>
            <Banner latest={latest} showBanner={showBanner} drawBanner={drawBanner}/>
            <Video latest={latest} drawBanner={drawBanner}/>
        </div>
    </div>
}

const Banner = (props) => {
    const style = (props.showBanner) ? 'visible' : 'hidden'
    const latest = props.latest
    if (latest === undefined) return <div/>
    const youtubeLink = latest.youtubeLink
    const bannerLink = latest.bannerLink
    if (props.drawBanner === false) return <div/>
    return <div id='banner' className={['col', style].join(' ')}>
        <a href={youtubeLink} className="btn btn-link nav-link">
            <img src={bannerLink} className="mx-auto img-fluid" alt="banner"/>
        </a>
    </div>
}

const Video = (props) => {
    const latest = props.latest
    if (props.drawBanner) return <div/>

    if (latest === undefined) return <div/>
    else if (latest.youtubeEmbed === null) return <div/>
    else if (latest.youtubeEmbed.startsWith('https://') === false) return <div/>
    else return <div className={'container-fluid'}>
            <div className={'row'}>
                <div className='col col-12'>
                    <YoutubeIframe latest={latest}/>
                </div>
                <div className='col col-lg-6 col-md-12'>
                    <div className='text-left text-uppercase'>
                        Performance by<br/>The Virtual Video Game Orchestra
                    </div>
                </div>
                <div className='col col-lg-6 col-md-12'>
                    <div className='text-right text-uppercase'>
                        {latest.composers} <br/>
                        {latest.arrangers}
                    </div>
                </div>
            </div>
        </div>
}


const Credits = (props) => {
    if (props.showCredits) {
        const credits = props.credits
        console.log(props.credits)

        return <div>
            <div className={'btn btn-link'} onClick={(_) => props.toggleCredits()}>
                <p className={'text-left'}>Hide credits.</p>
            </div>
            {credits.map(topicRow => <CreditsTopic key={topicRow.name} topicRow={topicRow}/>)}
        </div>
    } else {
        return <div className={'btn btn-link'} onClick={(_) => props.toggleCredits()}>
            <p className={'text-left text-center text-light'}>Show credits.</p>
        </div>
    }
}

const CreditsTopic = (props) => {
    const topicRow = props.topicRow
    return <div>
        <div className="row">
            <div className="col text-center">
                <h2><strong>-- {topicRow.name} --</strong></h2>
            </div>
        </div>
        <div className="card-columns">
            {topicRow.rows.map(credit => <CreditsTeam credit={credit}/>)}
        </div>
    </div>
}

const CreditsTeam = (props) => {
    const credit = props.credit
    return <div className="card bg-transparent text-center">
        <h5>{credit.name}</h5>
        <ul className="list-unstyled">
            {credit.rows.map(x => <li>{x.name} <small>{x.bottomText}</small></li>)}
        </ul>
    </div>
}


export default hot(module)(Feature)