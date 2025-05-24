import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import PawnlessArrangementPage from './pages/PawnlessArrangementPage';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={PawnlessArrangementPage} />
      </Switch>
    </Router>
  );
}

export default App;