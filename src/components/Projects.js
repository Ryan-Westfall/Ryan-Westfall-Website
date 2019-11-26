import React from 'react';
import { Link } from 'gatsby';
class Projects extends React.Component {
    constructor(props) {
        super(props);
    
            this.state = {
                repos: []
            }
    }

    componentDidMount() {
        fetch('https://api.github.com/users/Ryan-Westfall/repos')
            .then(response => response.json())
            .then(data => this.setState({repos:data}))
            

            

    }


        
        
    render() {
        return (
            <div className="projects">
              <Link to="editor" className="repo">
              <div className="repoBox">
                          <div>
                            <h4>Text Editor Application (Incomplete)</h4>
                          </div>
                          <div style={{padding:"1rem 0px", opacity:"0.4"}}>
                            Has specific use case to create memory palaces
                          </div>
                      </div>
              </Link>
                {this.state.repos.map(function(repo) {
                  if(repo.name === "Ryan-Westfall.github.io") {
                    return;
                  }
                    return (
                        <a href={repo.html_url} className="repo">
                        <div className="repoBox">
                          <div>
                            <h4>{repo.name}</h4>
                          </div>
                          <div style={{padding:"1rem 0px", opacity:"0.4"}}>
                            {repo.description}
                          </div>
                      </div>
                      </a>
                    );
                  })}
                
            
            </div>
        );
    }
}

export default Projects;