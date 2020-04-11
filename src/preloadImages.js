
const imagesToPreload = [
	'bitmoji/standard.png',
	'bitmoji/drink-coffee.png',
	'bitmoji/no-hope.png',
	'bitmoji/not-bad.png',
	'bitmoji/not-impressed.png',
	'bitmoji/smile.png',
	'bitmoji/wry.png',
	'bitmoji/what-you-doing.png',
	'bitmoji/perplexed.png',
	'bitmoji/sad.png',
	'bitmoji/sorry.png',
	'bitmoji/suspicious.png',
	'bitmoji/unsure.png',
	'bitmoji/well-ok.png',
	'bitmoji/clap-left.png',
	'bitmoji/clap-right.png',
	'bitmoji/spit-coffee.png',
	'bitmoji/katana.png',
] 

export default function preloadImages() {
	for (let img of imagesToPreload)
		(new Image).src = img
}