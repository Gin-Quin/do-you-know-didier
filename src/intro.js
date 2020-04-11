export default `
	face drink-coffee
	say Je m'appelle Didier.
	say Je suis un surhomme.

	face not-impressed
	say Si tu ne sais pas qui je suis : dégage !
	say Tu n'as rien à faire ici.

	face drink-coffee
	say Si tu es de la gendarmerie : je tiens à préciser que je suis un personnage fictif.
	say Et que je n'ai jamais tué personne.
	say Pour tous les autres...

	face smile
	say Vous savez pourquoi vous êtes là, hein ?
	show dolmenia
	say <b>DOLMENIA</b>, le plus grand parc à thème de la région va bientôt ouvrir ses portes.

	face drink-coffee
	say Rose-Marie, ma DRH (une vraie connasse soit dit en passant) a voulu me récompenser de mes efforts au boulot.
	show dolmenia
	say Pour me féliciter, elle m'a « offert » deux billets pour l'inauguration de <b>DOLMENIA</b> à la seule condition que j'y aille accompagné d'un <i>ami</i>.
	hide dolmenia

	face suspicious
	say Je déteste les parcs d'attraction et les saloperies d'activités culturelles à la con. C'est toujours plein de... familles !

	face smile
	say Par contre, s'il y a une chose que j'adore dans la vie, c'est faire chier les membres de ma famille et mes amis.

	face suspicious
	say Les <i>vrais</i> amis.

	face not-impressed
	say Pas les randoms comme vous trouvés sur internet.

	face drink-coffee
	say Tout le monde en ville veut des billets pour aller à cette inauguration débile. J'ai donc l'occasion de faire enrager un max' de crétins !
	say Mais pour cela, j'ai besoin que l'un de vous m'accompagne.
	say Voici donc un test pour savoir si vous me connaissez bien et si vous méritez que je sois votre ami.

	say Comme je n'ai pas du tout envie de perdre mon temps avec les plus craignos d'entre vous...

	face smile
	say On va directement passer aux questions les plus difficiles.
	say  C'est juste histoire de faire le premier tri entre les nazes et les gros nazes.

	startGame
`