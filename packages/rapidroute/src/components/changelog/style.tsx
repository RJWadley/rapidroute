import styled from "styled-components"

const Scoped = styled.div`
  margin: 0;
  font-family: Rubik, sans-serif;

  --light-mint: #a0eec0;
  --mint: #8ae9c1;
  --main: #86cd82;
  --forest: #72a276;
  --dim-gray: #666b6a;

  h1 {
    font-size: 2rem;
    line-height: 2rem;
    font-weight: bold;
    margin: 0;
  }

  h2 {
    font-size: 1.5rem;
    line-height: 1.5rem;
    font-weight: bold;
    margin: 30px 0;
  }

  h3 {
    font-size: 1.25rem;
    line-height: 1.25rem;
    font-weight: bold;
    margin: 20px 0;
  }

  li {
    margin-left: 1rem;

    :before {
      content: "•";
      color: black;
      font-weight: bold;
      display: inline-block;
      width: 1rem;
      margin-left: -1rem;
    }
  }

  .title-container {
    width: 100%;
    height: 250px;
    padding-bottom: 50px;
    background-color: var(--main);
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    animation: descend 1s;
  }

  .title {
    font-size: 2em;
    line-height: 2em;
    position: relative;
  }

  .changelog {
    max-width: min(1000px, 90vw);
    margin: 0 auto;
    margin-bottom: 100px;
  }

  li {
    margin-bottom: 10px;
  }

  .button-container {
    margin: 10px;
  }

  a {
    display: block;
    margin: 20px auto;
    text-align: center;
    max-width: 300px;
    text-decoration: none;
    color: black;
    background-color: var(--light-mint);
    padding: 10px;
    border-radius: 5px;
  }
`

export default Scoped
