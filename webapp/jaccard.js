const intersection = (a, b) => {
	
	let x = []
	
  	let check = e => {

		if (~b.indexOf(e)) x.push(e)

	}

	a.forEach(check)

	return x

}

const union = (a, b) => {

	let x = []

	let check = function (e) {

		if (!~x.indexOf(e)) x.push(e)

	}

	a.forEach(check)

	b.forEach(check)

	return x

}

const index = (a, b) => {

	return intersection(a, b).length / union(a, b).length

}

const distance = (a, b) => {

	return 1 - index(a, b)

}
