import React, { Component, Fragment } from 'react';
import { get, post } from 'axios';
import styled from 'styled-components';
import { CanvasJSChart } from './util/canvasjs.react';

const PrintTitle = styled.h1`
  display: inline-block;
  font-size: 100%;
`;

const PrintUnitAndChannel = styled.h1`
  display: inline-block;
  font-size: 100%;
  margin-left: 600px;
`;

const PrintDate = styled.h1`
  display: inline-block;
  font-size: 100%;
  float: right;
`;

const UnitForm = styled.form`
  display: inline-block;
`;

const UnitNumberLabel = styled.label`
  display: inline-block;
  font-size: 150%;
  margin-left: 5px;
`;

const UnitNumber = styled.input`
  display: inline-block;
  width: 35px;
  margin-left: 15px;
  margin-bottom: 10px;
  transform: scale(1.45);
`;

const ProgramTitle = styled.h1`
  display: inline-block;
  font-size: 150%;
  margin-left: 233px;
`;

const Print = styled.button`
  padding: 5px 5px;
  margin-left: 433px;
`;

const ChannelText = styled.label`
  display: inline-block;
  font-size: 150%;
  margin-left: 40px;
`;

const ChannelRadio = styled.input`
  display: inline-block;
  margin-right: 25px;
  margin-left: 10px;
  transform: scale(1.25);
`;

const LowSweep = styled.button`
  padding: 14px 16px;
  margin-right: 10px;
  margin-left: 130px;
  font-size: 100%;
`;

const HighSweep = styled.button`
  padding: 14px 16px;
  font-size: 100%;
`;

const transformData = sweep => {
  const data = [];
  let level = 13;
  sweep.forEach(([power, dBm], i) => {
    if (i !== 0 && +dBm < data[data.length - 1].y)
      data[data.length - 1] = {
        ...data[data.length - 1],
        indexLabel: `${(level -= 1)}, {y}`,
        markerType: 'triangle',
        markerColor: '#6B8E23',
        markerSize: 12,
      };
    data.push({ x: +power, y: +dBm });
  });
  return data;
};

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = { sweep: [], channel: '', unit: '', printing: false, printingSweep: [] };

    this.print = this.print.bind(this);
    this.togglePrint = this.togglePrint.bind(this);
    this.handleUnitNumberChange = this.handleUnitNumberChange.bind(this);
    this.handleChannelSwitch = this.handleChannelSwitch.bind(this);
    this.sweepSystem = this.sweepSystem.bind(this);
  }

  componentDidUpdate() {
    const { printing } = this.state;
    if (printing) {
      this.print();
    }
  }

  print() {
    window.print();
    this.togglePrint();
  }

  async togglePrint() {
    const { printing, channel, unit } = this.state;
    if (!printing && channel) {
      const {
        data: { data: printingSweep },
      } = await get('/api/sweep/data', { params: { channel, unit } });
      this.setState({ printing: true, printingSweep });
    } else {
      this.setState({ printing: false, printingSweep: [] });
    }
  }

  handleUnitNumberChange({ target: { value } }) {
    this.setState({ unit: +value });
  }

  async handleChannelSwitch({ target: { value } }) {
    const { unit } = this.state;
    if (!unit) return;
    const {
      data: { data: sweep },
    } = await get('/api/sweep/data', { params: { channel: +value, unit } });
    this.setState({ channel: +value, sweep });
  }

  /* eslint-disable no-alert */
  async sweepSystem({ target: { value: type } }) {
    const { channel, unit } = this.state;
    if (
      channel &&
      ((type === 'high' || type === 'full') &&
        !window.confirm(`Make sure that the manual pop-up check has passed for this channel before proceeding`))
    ) {
      return;
    }
    const frequency = [1.25, 2.25, 4, 7, 15][+channel - 1];
    let startPower = -70;
    let endPower = -70;
    if (type === 'low') {
      startPower = -50;
      endPower = 15;
    } else if (type === 'high') {
      startPower = -50;
      endPower = 15;
    } else if (type === 'full') {
      startPower = -50;
      endPower = 15;
    } else {
      return;
    }

    try {
      const {
        data: { sweep },
      } = await get('/api/sweep', {
        params: { frequency, startPower, endPower },
      });
      this.setState({ sweep });
      await post('/api/sweep/data', { channel, sweep, unit, type });
    } catch (e) {
      alert(e);
    }
  }
  /* eslint-enable no-alert */

  render() {
    const { sweep, channel, unit, printing, printingSweep } = this.state;

    const chartOptions = {
      width: '1200',
      height: '500',
      axisX: { title: 'Power' },
      axisY: { title: 'Signal' },
      data: [
        {
          type: 'line',
        },
      ],
    };

    //* printing view
    if (printing) {
      chartOptions.data[0].dataPoints = transformData(printingSweep);
      const today = new Date();
      const date = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
      return (
        <Fragment>
          <PrintTitle>Sweep Data</PrintTitle>
          <PrintUnitAndChannel>
            Unit # {unit}, Channel: {channel}
          </PrintUnitAndChannel>
          <PrintDate>{date}</PrintDate>
          <br />
          <CanvasJSChart options={chartOptions} />
        </Fragment>
      );
    }
    //* normal view

    chartOptions.data[0].dataPoints = transformData(sweep);
    return (
      <Fragment>
        <UnitForm onSubmit={e => e.preventDefault()}>
          <UnitNumberLabel>Unit #:</UnitNumberLabel>
          <UnitNumber type="number" min="0" value={unit} onChange={this.handleUnitNumberChange} />
        </UnitForm>
        <ProgramTitle>Automatic Sweep Test</ProgramTitle>
        <Print type="submit" onClick={this.togglePrint}>
          Print
        </Print>
        <br />
        {[1, 2, 3, 4, 5].map(num => (
          <Fragment key={num}>
            <ChannelText>Channel {num}</ChannelText>
            <ChannelRadio type="radio" checked={channel === num} onChange={this.handleChannelSwitch} value={num} />
          </Fragment>
        ))}
        <LowSweep type="submit" value="low" onClick={this.sweepSystem}>
          Low Sweep
        </LowSweep>
        <HighSweep type="submit" value="high" onClick={this.sweepSystem}>
          High Sweep
        </HighSweep>
        {/* eslint-disable-next-line no-return-assign */}
        <CanvasJSChart options={chartOptions} />
      </Fragment>
    );
  }
}
