import './App.css';
import Parse from 'parse/dist/parse.min.js';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { BookList } from './BookList';
import { ObjectCreationForm } from './ObjectCreationForm';
import { BookCreationForm } from './BookCreationForm';

// Your Parse initialization configuration goes here
const PARSE_APPLICATION_ID = 'yq9jjiz8nTIKTTDTliJqxyqCNH0oZSR5u2kH42ge';
const PARSE_HOST_URL = 'https://parseapi.back4app.com/';
const PARSE_JAVASCRIPT_KEY = 'Zxhr9RQkEGn6CYL5f02kSUItsi1p78bDgzEqBoh1';
Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);
Parse.serverURL = PARSE_HOST_URL;

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/create-object/:objectType">
            <ObjectCreationForm />
          </Route>
          <Route path="/create-book">
            <BookCreationForm />
          </Route>
          <Route path="/">
            <BookList />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
