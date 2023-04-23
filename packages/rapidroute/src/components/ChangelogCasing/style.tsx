import styled from "styled-components"

/**
 * mostly based off styles from RapidRoute v1. one day we'll maybe update the design lol
 */
const Scoped = styled.div`
  margin: 0;
  font-family: Inter, sans-serif;

  h1 {
    font-size: 2rem;
    font-weight: bold;
    margin: 0;
  }

  h2 {
    border-top: 2px solid var(--mid-background);
    padding-top: 30px;
    font-size: 1.5rem;
    font-weight: bold;
    margin: 30px 0;
  }

  h3 {
    font-size: 1.25rem;
    font-weight: bold;
    margin: 20px 0;
  }

  .title-container {
    width: 100%;
    height: 350px;
    padding-bottom: 50px;
    background-color: var(--button-green);
    color: var(--invert-button-green);
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    animation: descend 1s;
  }

  .title {
    font-size: 3em;
    position: relative;
  }

  .changelog {
    max-width: min(1000px, 90vw);
    margin: 0 auto;
    margin-bottom: 100px;
  }

  li {
    margin-left: 1rem;
    margin-bottom: 10px;

    /* add back bullet points */
    ::before {
      content: "🔥";
      color: var(--text-color);
      font-weight: bold;
      display: inline-block;
      width: 1.5rem;
      margin-left: -1rem;
    }
  }

  .button-container {
    margin: 10px;
  }

  a {
    display: block;
    margin: 30px auto;
    text-align: center;
    width: max-content;
    text-decoration: none;
    background-color: var(--button-green);
    color: var(--invert-button-green);
    font-weight: bold;
    padding: 20px 30px;
    font-size: 20px;
    border-radius: 20px;
  }
`

export default Scoped
