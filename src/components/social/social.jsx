import React from "react"

const Social = props => {
  return (
    <div>
      <a href={props.social.linkedIn}>LinkedIn</a>&nbsp;|&nbsp;
      <a href={props.social.gitHub}>GitHub</a>&nbsp;|&nbsp;
      <a href={props.social.stackOverflow}>Stack Overflow</a>&nbsp;|&nbsp;
      <a href={props.social.twitter}>Twitter</a>
    </div>
  )
}

export default Social
