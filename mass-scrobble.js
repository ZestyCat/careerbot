const users = []
const plotButton = document.getElementById('plot')
const userField = document.getElementById('userInput')

const getTopTracks = async (user) => {
	const data = await sendHttpRequest('GET', `${ROOT_URL}?method=user.gettoptracks&user=${user}&api_key=${api_key}&format=json`)	
	let json = JSON.parse(data)
	return(json['toptracks']['track'])
}

const clear = () => {
	d3.select('#divplot')
	.selectAll('svg')
	.remove()
}

const plot = async (user) => {
	const data = await getTopTracks(user)

	let width = 100
	let barHeight = 20 
	let height = (barHeight + 2) * data.length

	let xScale = d3.scaleLinear()
		.domain([0, Math.max(...data.map(d => { return d.playcount }))])
		.range([0, width])
	
	let yScale = d3.scaleLinear()
		.domain([0, data.length])
		.range([0, height])
	
	let plot = d3.select("#divplot")
		.append('svg:svg')
		.attr('width', width*4)
		.attr('height', height)

	plot.selectAll('rect')
	.data(data)
	.enter()
	.append('a')
	.attr('xlink:href', datum => { return datum.url })
		.append('svg:rect')
		.attr('x', xScale(0))
		.attr('y', (datum, index) => { return yScale(index) })
		.attr('width', datum => { return xScale(datum.playcount) })
		.attr('height', barHeight )
		.attr('fill', '#2d578b')
		.attr('class', (datum, index) => { return user + index })
		.attr('rank', (datum, index) => { return user + index })

	plot.selectAll('text')
	.data(data)
	.enter()
	.append('svg:text')
	.attr('x', datum => { return xScale(datum.playcount) })
	.attr('y', (datum, index) => { return yScale(index) })
	.attr('dy', barHeight/1.5)
	.attr('dx', '-0.5em')
	.attr('text-anchor', 'end')
	.attr("style", `font-size: ${barHeight/1.5}; font-family: Times New Roman`)
	.text(datum => { return datum.playcount })
	.attr('fill', 'white')

	console.log(data)

	plot.selectAll('text.yAxis')
	.data(data)
	.enter()
	.append('a')
	.attr('xlink:href', datum => { return datum.url })
		.append('svg:text')
		.attr('x', datum => { return xScale(datum.playcount)})
		.attr('y', (datum, index) => { return yScale(index)})
		.attr('dy', barHeight/1.5)
		.attr('dx', '0.5em')
		.attr('text-anchor', 'start')
		.attr("style", `font-size: ${barHeight/1.5}; font-family: Times New Roman`)
		.text(datum => { return `${datum.artist.name} - ${datum.name}` })
		.attr('class', 'yAxis')
		.attr('mbid', datum => datum.mbid)
		.attr('fill', '#2d578b')
		.attr('text-decoration', 'underline')
		.attr('class', (datum, index) => { return `${user + index} yAxis` })
		.attr('rank', (datum, index) => { return user + index })
		

	plot.selectAll('rect, text.yAxis')
	.on('mouseover', handleMouseOver)
	.on('mouseout', handleMouseOut)
}

function handleMouseOver(d, i) {
	let thisRank = this.getAttribute('rank')
	d3.select('#divplot')
	.selectAll('rect, text.yAxis')
	.attr('fill', '#2d578b')
	d3.selectAll(`.${thisRank}`)
	.attr('fill', 'orange')
}

function handleMouseOut(d, i) {
	d3.select('#divplot')
	.selectAll('rect, text.yAxis')
	.attr('fill', '#2d578b')
}

plotButton.addEventListener('click', () => { clear(), plot(userField.value) })
