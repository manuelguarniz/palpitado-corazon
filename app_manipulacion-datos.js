

let data = [1, 2, 3, 4, 5];

let showData = (item, index) => {
  console.log(item);
  return `${item}-${index}`;
}

// d3.selectAll('p')
//   .style('background-color', 'red')
//   .style('width', '300px')
//   .style('height', '200px')
//   .data(data)
//   .text(showData);

// d3.select('body')
//   .selectAll('p')
//   .data(data)
//   .enter()
//   .append('p')
//   .text(showData);

d3.select('body')
  .selectAll('p')
  .data(data)
  .join(
    enter => enter.append('p')
      .style('background-color', 'red')
      .style('width', '300px')
      .style('height', '200px'),
    update => update,
    exit => exit.remove(),
  )
  .text(showData);
