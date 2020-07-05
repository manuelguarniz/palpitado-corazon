window.onload = () => {
  let svg = null;
  let circle = null;
  let circleTransition = null;
  let latestBeat = null;
  let insideBeat = false;
  let data = [];

  let SECONDS_SAMPLE = 5;
  let BEAT_TIME = 400;
  let TICK_FREQUENCY = (SECONDS_SAMPLE * 1000) / BEAT_TIME;
  let BEAT_VALUES = [0, 0, 3, -4, 10, -7, 3, 0, 0];

  let CIRCLE_FULL_RADIUS = 40;
  let MAX_LATENCY = 5000;

  let colorScale = d3.scale.linear()
  .domain([BEAT_TIME, (MAX_LATENCY - BEAT_TIME) / 2, MAX_LATENCY])
  .range(["#6D9521", "#D77900", "#CD3333"]);

  let radiusScale = d3.scale.linear()
    .range([5, CIRCLE_FULL_RADIUS])
    .domain([MAX_LATENCY, BEAT_TIME]);

  let beat = () => {
    if (insideBeat) return;
    insideBeat = true;

    let now = new Date();

    let nowTime = now.getTime();

    if (data.length > 0 && data[data.length - 1].date > 0) {
      data.splice(data.length - 1, 1);
    }

    data.push({
      date: now,
      value: 0,
    });

    let step = BEAT_TIME / BEAT_VALUES.length - 2;

    for (var i = 1; i < BEAT_VALUES.length; i++) {
      data.push({
        date: new Date(nowTime + i * step),
        value: BEAT_VALUES[i],
      });
    }

    latestBeat = now;

    circleTransition = circle
      .transition()
      .duration(BEAT_TIME)
      .attr("r", CIRCLE_FULL_RADIUS)
      .attr("fill", "#6D9521");
    
    console.log(data.length)

    setTimeout(() => {
      insideBeat = false;
    }, BEAT_TIME);
  };

  let svgWrapper = document.getElementsByClassName("canvas")[0];

  let margin = { left: 10, top: 10, right: CIRCLE_FULL_RADIUS * 3, bottom: 10 },
    width = svgWrapper.offsetWidth - margin.left - margin.right,
    height = svgWrapper.offsetHeight - margin.top - margin.bottom;

  // create SVG
  svg = d3
    .select(".canvas")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.bottom + margin.top)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  circle = svg
    .append("circle")
    .attr("fill", "#6D9521")
    .attr("cx", width + margin.right / 2)
    .attr("cy", height / 2)
    .attr("r", CIRCLE_FULL_RADIUS);

  // init scales
  let now = new Date();
  let fromDate = new Date(now.getTime() - SECONDS_SAMPLE * 1000);

  // create initial set of data
  data.push({
    date: now,
    value: 0,
  });

  let x = d3.time
    .scale()
    .domain([fromDate, new Date(now.getTime())])
    .range([0, width]);
  let y = d3.scale.linear()
    .domain([-10, 10])
    .range([height, 0]);

  let line = d3.svg
    .line()
    .interpolate("basis")
    .x((d) => {
      return x(d.date);
    })
    .y((d) => {
      return y(d.value);
    });

  let xAxis = d3.svg
    .axis()
    .scale(x)
    .orient("bottom")
    .ticks(d3.time.seconds, 1)
    .tickFormat(function (d) {
      var seconds = d.getSeconds() === 0 ? "00" : d.getSeconds();
      // return seconds % 10 === 0 ? d.getMinutes() + ":" + seconds : ":" + seconds;
      return d.getMinutes() + ":" + seconds;
    });

  // add clipPath
  svg
    .append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

  let axis = d3
    .select("svg")
    .append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  let path = svg
    .append("g")
    .attr("clip-path", "url(#clip)")
    .append("path")
    .attr("class", "line");

  svg.select(".line").attr("d", line(data));
  let transition = d3.select("path").transition().duration(100).ease("linear");

  let tick = () => {
    transition = transition
      .each(() => {
        // update the domains
        now = new Date();
        fromDate = new Date(now.getTime() - SECONDS_SAMPLE * 1000);
        x.domain([fromDate, new Date(now.getTime() - 100)]);

        var translateTo = x(new Date(fromDate.getTime()) - 100);

        // redraw the line
        svg
          .select(".line")
          .attr("d", line(data))
          .attr("transform", null)
          .transition()
          .attr("transform", "translate(" + translateTo + ")");

        // slide the x-axis left
        axis.call(xAxis);
      })
      .transition()
      .each("start", tick);
  };
  tick()

  setInterval(() => {
    now = new Date();
    fromDate = new Date(now.getTime() - SECONDS_SAMPLE * 1000);

    for (var i = 0; i < data.length; i++) {
      if (data[i].date < fromDate) {
        data.shift();
      } else {
        break;
      }
    }

    if (insideBeat) return;

    data.push({
      date: now,
      value: 0,
    });

    if (circleTransition != null) {
      let diff = now.getTime() - latestBeat.getTime();

      if (diff < MAX_LATENCY) {
        circleTransition = circle
          .transition()
          .duration(TICK_FREQUENCY)
          .attr("r", radiusScale(diff))
          .attr("fill", colorScale(diff));
      }
    }
  }, TICK_FREQUENCY);

  setInterval(() => {
    beat();
  }, 2000);

  beat();
};

window.addEventListener("click", (e) => {
  console.log("X -> ", e.clientX);
  console.log("Y -> ", e.clientY);
});
