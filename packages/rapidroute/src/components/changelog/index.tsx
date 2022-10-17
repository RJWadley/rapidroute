/* eslint-disable max-lines */
import React from "react"

import { Link } from "gatsby"

import Scoped from "./style"

export default function Changelog() {
  return (
    <Scoped>
      <div className="title-container">
        <h1 className="title">Changelog</h1>
      </div>
      <div className="changelog">
        <div>
          <h2>(Unreleased) 2022-XX-XX - Version 3.0</h2>

          <h3>New Features</h3>
          <ul>
            <li>visual redesign!</li>
            <li>The entire site has been rewritten from scratch in React</li>
            <li>Using a new, significantly faster searching algorithm</li>
            <li>
              Routing to and from arbitrary coordinates, just type them into the
              search bar
            </li>
            <li>Navigate to or from your current location</li>
            <li>
              Now pulling airport locations straight from dynmap where possible
            </li>
            <li>Better text to speech engine</li>
            <li>Voice navigation rewrite</li>
            <li>When navigating, auto recalculate route</li>
          </ul>
          <h3>Planned Features</h3>
          <ul>
            <li>More robust searching, showing information about places</li>
            <li>Automatically import routes from mrt wiki in some cases</li>
            <li>Data editable on-site</li>
            <li>Selectable map</li>
          </ul>

          <Link to="/">I love it, take me to RapidRoute</Link>
        </div>
        <hr />
        <div>
          <h2>2021-10-05 - The Redesign Update</h2>
          <ul>
            <li>
              Searching algorithm has been re-written from scratch and is now
              significantly faster
            </li>
            <li>
              Added coordinates to most destinations to allow better routing
            </li>
            <li>Improved destination search functionality</li>
            <li>Huge visual redesign</li>
            <li>Added searching progress bar and new searching animation</li>
            <li>
              Routes are now collapsable and will display a short, identifiable
              description
            </li>
            <li>
              The system is now better at filtering out and combining nearly
              identical routes
            </li>
            <li>Added an insane easter egg</li>
            <li>Cities are now included as destinations</li>
            <li>All spawn warps are now available</li>
            <li>
              Search is now smart enough to correct some typos. (For example, if
              you meant to type Bakersville but accidentally typed
              ppaekcyiyrssphyiyiyi)
            </li>
            <li>Dark mode is now available</li>
            <li>Results are now cached for faster repeat searches</li>
          </ul>
          <div>
            <h3>Plus! Introducing MRT Navigate</h3>
            <ul>
              <p>Voice directions synchronized with your in-game player</p>
              <p>Your current position displayed on the server map</p>
              <p>As well as your progress through the route</p>
              <p>It&apos;s pretty neat, give it a try!</p>
            </ul>
          </div>
          <Link to="/">I love it, take me to RapidRoute</Link>
          <h3>Coming soon:</h3>
          <ul>New modes of transportation</ul>
        </div>
        <hr />
        <div>
          <h2>2021-10-05 - The Color Update</h2>
          <ul>
            <li>Participating airlines now show logos in results</li>
            <li>Participating airlines are now color coded in results</li>
            <li>MRT lines are now color coded in results</li>
            <li>Support for airline code-sharing</li>
            <li>A few minor style and layout changes</li>
          </ul>
          <Link to="/">I love it, take me to RapidRoute</Link>
          <h3>Coming soon:</h3>
          <ul>
            <li>Still in progress as previously mentioned:</li>
            <ul>
              <li>Spawn warps</li>
              <li>City destination groups for easier selection</li>
              <li>Seaplane to MRT transfers where applicable</li>
            </ul>
            <li>Significant backend changes focused on optimization</li>
            <li>Visual refresh</li>
            <li>
              Work has begun on MRT Navigate, a voice navigation system for MRT
            </li>
          </ul>
        </div>
        <hr />

        <div>
          <h2>2021-10-02 - The Seaplane Update</h2>
          <ul>
            <li>Added basic support for seaplanes and seaports</li>
            <li>
              Support for new dynamic importing so that new airlines and
              airports won&apos;t break things
            </li>
            <li>A few bug fixes</li>
            <li>Removed Herobrine</li>
          </ul>
          <Link to="/">I love it, take me to RapidRoute</Link>
          <h3>Coming soon:</h3>
          <ul>
            <li>Spawn warps</li>
            <li>City destination groups for easier selection</li>
            <li>Seaplane to MRT transfers where applicable</li>
          </ul>
        </div>
        <hr />
        <div>
          <h2>2021-02-10 - The Helicopter Update</h2>
          <ul>
            <li>Helicopters Helicopters Helicopters Helicopters</li>
            <li>
              Support for destinations without an IATA code (eg. Mojang Town
              West Heliport)
            </li>
            <li>
              Flights with gate information are prioritized in search results
            </li>
            <li>
              Searching (in the text boxes) organizes categories by most
              relevant
            </li>
            <li>Finding routes is faster and uses less memory</li>
            <li>Improved page performance, especially on slower devices</li>
            <li>Some data stored on your device is compressed to save space</li>
            <li>Use of sessionStorage API to reduce CPU usage</li>
            <li>
              Fixed an issue where sometimes the page would just reload over and
              over (cwazy)
            </li>
          </ul>
          <Link to="/">I love it, take me to RapidRoute</Link>
          <h3>Coming soon:</h3>
          <ul>
            <li>Airline logos</li>
            <li>Customized search results</li>
          </ul>
        </div>
        <hr />
        <div>
          <h2>2021-02-08 - The MRT Transit update</h2>
          <ul>
            <li>
              Data is now sourced from the MRT Transit spreadsheet, which means
              more airlines, more flights, more airports and more up-to-date
              info!
            </li>
            <li>
              You can now use the site offline (How you would be on the MRT
              server without internet I&apos;m not sure but you can have this
              one anyway)
            </li>
            <li>
              Airlines can now update their own gate information via a
              spreadsheet. If you or a loved one is an airline, send
              Scarycrumb45 a dm and he&apos;ll hook you up.
            </li>
            <li>Teleporting to spawn is now considered in search results.</li>
            <li>
              RapidRoute can now be added to your phones home screen as a web
              app (probably). Isn&apos;t that fancy?
            </li>
          </ul>
          <Link to="/">I love it, take me to RapidRoute</Link>
          <h3>Coming soon:</h3>
          <ul>
            <li>Helicopters? Helicopters.</li>
          </ul>
        </div>
      </div>
    </Scoped>
  )
}
