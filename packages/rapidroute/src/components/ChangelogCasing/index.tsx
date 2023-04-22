/* TODO  max-lines */

import UniversalLink from "utils/Loader/UniversalLink"

import Scoped from "./style"

export default function Changelog() {
  return (
    <Scoped>
      <div className="title-container">
        <h1 className="title">Changelog</h1>
      </div>
      <div className="changelog">
        <div>
          <h2>2023-03-16 - Map Improvements</h2>
          <h3>New Features</h3>
          <ul>
            <li>
              The map is now searchable, and displays information about the
              place you searched for in the sidebar
            </li>
            <li>
              The map has been rewritten in PIXI.js, and is now much faster
            </li>
            <li>Cities are now displayed on the map</li>
          </ul>
          <UniversalLink to="/" transition="slide">
            I love it, take me to RapidRoute
          </UniversalLink>
        </div>
        <hr />
        <div>
          <h2>2022-12-09 - Version 3.0</h2>

          <h3>New Features</h3>
          <ul>
            <li>
              RapidRoute has been given a new look and feel, with a new logo,
              new style, smoother animations, and more.
            </li>
            <li>
              RapidRoute is now written in React, and is built with Gatsby.
            </li>
            <li>
              The searching algorithm has been improved, and is now much faster.
            </li>
            <li>
              You can now search coordinates by typing them into the search bar
              (e.g. &quot;123, 456&quot;).
            </li>
            <li>
              You can now also search your current location by typing
              &quot;Current Location&quot;.
            </li>
            <li>
              New Text to Speech engine, with more voices and better quality
            </li>
            <li>
              MRT Navigator will now recalculate your route if you are no longer
              on the optimal route
            </li>
            <li>
              MRT Navigator now features a smoother map, that supports panning
              and zooming, and will automatically center on your current
              location
            </li>
            <li>
              For installed desktop chrome users, a short history will show in
              the title bar
            </li>
            <li>Added a speech rate slider</li>
            <li>Added a new player selection screen</li>
            <li>Airport Locations are now pulled from dynmap if available</li>
          </ul>

          <UniversalLink to="/" transition="slide">
            I love it, take me to RapidRoute
          </UniversalLink>
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
              Routes are now collapsible and will display a short, identifiable
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
          <UniversalLink to="/" transition="slide">
            I love it, take me to RapidRoute
          </UniversalLink>
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
          <UniversalLink to="/" transition="slide">
            I love it, take me to RapidRoute
          </UniversalLink>
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
          <UniversalLink to="/" transition="slide">
            I love it, take me to RapidRoute
          </UniversalLink>
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
          <UniversalLink to="/" transition="slide">
            I love it, take me to RapidRoute
          </UniversalLink>
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
              spreadsheet. If you or a loved one is an airline, send Scarycrumb
              a dm and he&apos;ll hook you up.
            </li>
            <li>Teleporting to spawn is now considered in search results.</li>
            <li>
              RapidRoute can now be added to your phones home screen as a web
              app (probably). Isn&apos;t that fancy?
            </li>
          </ul>
          <UniversalLink to="/" transition="slide">
            I love it, take me to RapidRoute
          </UniversalLink>
          <h3>Coming soon:</h3>
          <ul>
            <li>Helicopters? Helicopters.</li>
          </ul>
        </div>
      </div>
    </Scoped>
  )
}
