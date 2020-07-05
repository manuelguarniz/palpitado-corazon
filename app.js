

let data = [1, 2, 3, 4, 5];

let showData = (item, index) => {
  console.log(item);
  return `${item}-${index}`;
}

let buildBar = (item) => {
  console.log(item[0]);
  console.log(item[1]);
}

d3.json('./data/bars-data.json', (data) => {
  d3.select('.canvas')
    .selectAll('div')
    .data(data)
    .enter()
    .append('div')
    .style('width', (value) => `${value*10}px`)
    .text((value) => `${value*10}`);
})

// console.log(d3)

// Promise.all([
//   d3.csv('./data/data.csv'),
//   d3.json('./data/db.json')
// ]).then(buildBar);

// d3.json('./data/db.json', buildBar);
