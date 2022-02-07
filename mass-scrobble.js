const users = []
const plotButton = document.getElementById('plot')
const username = document.getElementById('userInput')

const getTopTracks = async (user) => {
	const data = await sendHttpRequest('GET', `${ROOT_URL}?method=user.gettoptracks&user=${user}&api_key=${api_key}&format=json`)	
	let json = JSON.parse(data)
	return(json['toptracks']['track'])
}


const plot = async () => {
	
	const data = await getTopTracks(username.value)

	let width = 300
	let barHeight = 20 
	let height = (barHeight + 2) * data.length

	d3.select('#divplot')
	.selectAll('svg')
	.remove()

	let xScale = d3.scaleLinear()
		.domain([0, Math.max(...data.map(d => { return d.playcount }))])
		.range([0, width])
	
	let yScale = d3.scaleLinear()
		.domain([0, data.length])
		.range([0, height])
	
	let plot = d3.select("#divplot")
		.append('svg:svg')
		.attr('width', width*3)
		.attr('height', height)
	
	plot.selectAll('rect')
	.data(data)
	.enter()
	.append('svg:rect')
	.attr('x', 0.75 * width)
	.attr('y', (datum, index) => { return yScale(index) })
	.attr('width', datum => { return xScale(datum.playcount) })
	.attr('height', barHeight )
	.attr('fill', '#2d578b')

	plot.selectAll('text')
	.data(data)
	.enter()
	.append('svg:text')
	.attr('x', datum => { return xScale(datum.playcount) + 0.75 * width })
	.attr('y', (datum, index) => { return yScale(index) })
	.attr('dy', barHeight/1.5)
	.attr('dx', '-0.5em')
	.attr('text-anchor', 'end')
	.attr("style", `font-size: ${barHeight/1.5}; font-family: Times New Roman`)
	.text(datum => { return datum.playcount })
	.attr('fill', 'white')

	plot.selectAll('text.yAxis')
	.data(data)
	.enter()
	.append('svg:text')
	.attr('x', 0.75 * width)
	.attr('y', (datum, index) => { return yScale(index)})
	.attr('dy', barHeight/1.5)
	.attr('dx', '-0.5em')
	.attr('text-anchor', 'end')
	.attr("style", `font-size: ${barHeight/1.5}; font-family: Times New Roman`)
	.text(datum => { return `${datum.name}` })
	.attr('class', 'yAxis')
	.attr('fill', 'white')

	plot.selectAll('rect')
	.on('mouseover', handleMouseOver)
	.on('mouseout', handleMouseOut)
}

function handleMouseOver(d, i) {
	d3.select(this)
	.attr('fill', 'orange')
}

function handleMouseOut(d, i) {
	d3.select(this)
	.attr('fill', '#2d578b')
}

plotButton.addEventListener('click', () => { plot() })
