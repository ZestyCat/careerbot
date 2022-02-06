// Hivemind scrobbler

const users = []

const getTopTracks = async (user) => {
	const data = await sendHttpRequest('GET', `${ROOT_URL}?method=user.gettoptracks&user=${user}&api_key=${api_key}&format=json`)	
	let json = JSON.parse(data)
	return(json['toptracks']['track'])
}


const plot = async () => {
	
	const data = await getTopTracks('g_biz')

	let width = 500
	let barWidth = width/data.length-2
	let height = barWidth * data.length

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
	.attr('x', xScale(0))
	.attr('y', (datum, index) => { return xScale(index) })
	.attr('width', datum => { return yScale(datum.playcount) })
	.attr('height', barWidth )
	.attr('fill', '#2d578b')

	plot.selectAll('text')
	.data(data)
	.enter()
	.append('svg:text')
	.attr('x', datum => { return xScale(datum.playcount) })
	.attr('y', (datum, index) => { return yScale(index) })
	.attr('dy', barWidth)
	.attr('dx', '1.2em')
	.attr('text-anchor', 'end')
	//.attr("style", "font-size: 6; font-family: Times New Roman")
	.text(datum => { return datum.playcount })
	.attr('fill', 'white')
/*
	plot.selectAll('text.xAxis')
	.data(data)
	.enter()
	.append('svg:text')
	.attr('x', (datum, index) => { return xScale(index) + barWidth })
	.attr('y', height)
	.attr('dx', -barWidth/2)
	.attr('text-anchor', 'middle')
	.attr("style", "font-size: 10; font-family: Times New Roman")
	.text(datum => { return datum.name })
	.attr('class', 'yAxis')
	.attr('fill', 'white')
*/
}


plot()
