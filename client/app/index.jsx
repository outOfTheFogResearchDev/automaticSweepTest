import React, { Component, Fragment } from 'react';
import { get } from 'axios';

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = { sweep: [] };

    this.doTheThing = this.doTheThing.bind(this);
  }

  async doTheThing() {
    const {
      data: { sweep },
    } = await get('/api/sweep', { params: { frequency: 1.25, startPower: -70, endPower: -40 } });
    this.setState({ sweep });
  }

  render() {
    const { sweep } = this.state;
    return (
      <Fragment>
        <button type="submit" onClick={this.doTheThing}>
          Do The Thing
        </button>
        {sweep.map(([power, dBm]) => (
          <div>
            Power: {power}, Signal: {dBm}
          </div>
        ))}
      </Fragment>
    );
  }
}
