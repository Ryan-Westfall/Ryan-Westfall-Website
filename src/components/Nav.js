import React from 'react';
import {Link} from 'gatsby';

class Nav extends React.Component {
    constructor(props) {
        super(props);
        this.state = {  };
    }
    render() {
        return (
<div>
<ul className="Nav">
  <li className="Nav"><Link to="/">Home</Link></li>
  <li className="Nav"><Link to="projects">Projects</Link></li>
</ul>
</div>
        );
    }
}

export default Nav;