// Hivemind scrobbler

const users = []

const getTopTracks = async (user) => {
	const data = await sendHttpRequest('GET', `${ROOT_URL}?method=user.gettoptracks&user=${user}&api_key=${api_key}&format=json`)	
	let json = JSON.parse(data)
	return(json['toptracks']['track'])
}


const plot = async () => {
	
	const data = await getTopTracks('g_biz')

	let barWidth = 25
	let width = (barWidth + 2) * data.length
	let height = 200

	let xScale = d3.scaleLinear()
		.domain([0, data.length])
		.range([0, width])

	let yScale = d3.scaleLinear()
		.domain([0, Math.max(...data.map(d => { return d.playcount }))])
		.range([0, height])

	let plot = d3.select("#divplot")
		.append('svg:svg')
		.attr('width', width)
		.attr('height', height)
	
	plot.selectAll('rect')
	.data(data)
	.enter()
	.append('svg:rect')
	.attr('x', (datum, index) => { return xScale(index) })
	.attr('y', datum => { return height - yScale(datum.playcount) })
	.attr('width', barWidth)
	.attr('height', datum => { return yScale(datum.playcount) })
	.attr('fill', '#2d578b')
	
	console.log(data)

	plot.selectAll('text')
	.data(data)
	.enter()
	.append('svg:text')
	.attr('x', (datum, index) => { return xScale(index) + barWidth })
	.attr('y', datum => { return height - yScale(datum.playcount) })
	.attr('dx', -barWidth/2)
	.attr('dy', '1.2em')
	.attr('text-anchor', 'middle')
	.attr("style", "font-size: 10; font-family: Times New Roman")
	.text(datum => { return datum.playcount })
	.attr('fill', 'white')
}

plot()
