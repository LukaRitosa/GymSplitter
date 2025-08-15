<script setup>
    import { RouterLink, useRouter } from 'vue-router'
    import { ref, onMounted } from 'vue'
    import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore'
    import { useUserStore } from '@/stores/userStore'
    import { db } from '@/firebase'

    const userStore= useUserStore()
    const splits=ref([])
    const router=useRouter()
    const loading=ref(false)


    const dohvatiSplitove = async () => {
        const snapshot = await getDocs(collection(db, 'splits'))
        splits.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    }

    onMounted(dohvatiSplitove)

    const odaberiSplit = async (split) => {
        loading.value=true
        
        try{
            const userDocRef=doc(db, `users/${userStore.currentUser.uid}`)
            const userSnap=await getDoc(userDocRef)

            if (!userSnap.exists()) {
                alert("Korisnički podaci nisu pronađeni")
                return
            }
            
            const userData=userSnap.data()
            const slobodniDani=userData.slobodni_dani || []
            const daniUTjednu=['Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota', 'Nedjelja']

            const split_kopija = JSON.parse(JSON.stringify(split))

            const kalendar={}
            let trenutniDanSplita=0

            for (let i = 0; i < 14; i++) {
                const danUTjednu=daniUTjednu[i % 7]
                const tjedan=Math.floor(i/7) + 1
                const kljuc=`Tjedan${tjedan}_${danUTjednu}`
            
                if (slobodniDani.includes(danUTjednu)) {
                    const danSplita = split_kopija.dani[trenutniDanSplita % split_kopija.broj_dana]
                    
                    kalendar[kljuc] = {
                        dan_u_tjednu: danUTjednu,
                        dan_u_ciklusu: i + 1,
                        split_dan_id: danSplita.dan,
                        naziv: danSplita.naziv
                    }
                    trenutniDanSplita++
                } else {
                    kalendar[kljuc] = {
                        dan_u_tjednu: danUTjednu,
                        dan_u_ciklusu: i + 1,
                        split_dan_id: null,
                        naziv: 'Odmor'
                    }
                }
            }

            split_kopija.kalendar = kalendar

            const userSplitRef = doc(db, `users/${userStore.currentUser.uid}/splits/${split.id}`)
            await setDoc(userSplitRef, split_kopija)

            await setDoc(userDocRef, {
                trenutniSplit: split.id,
                kalendar: kalendar,
                sljedeci_dan: 0
            }, { merge: true })

                router.push('/Split')
        } catch (error) {
            console.error("Greška pri spremanju splita:", error)
            alert("Došlo je do greške pri spremanju splita: " + error.message)
        } finally {
            loading.value = false
        }
    }


</script>

<template>

    <div>

        <div v-for="split in splits" class="border rounded p-4 mb-4 shadow">
            <h3 class="text-xl font-semibold">{{ split.naziv }}</h3>
            <p>Broj dana: {{ split.broj_dana }}</p>

            <ul class="mt-2 list-disc pl-5 text-sm text-gray-700">
                <li v-for="dan in split.dani" :key="dan.dan">
                Dan {{ dan.dan }} – {{ dan.naziv }} ({{ dan.vjezbe.length }} vježbi)
                </li>
            </ul>

            <button @click="odaberiSplit(split)" class="mt-3 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded">
                <span v-if="!loading">
                    Odaberi ovaj Split
                </span>
                <span v-else>
                    <img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif" class="inline w-5 h-5" />
                </span>
            </button>
        </div>

    </div>

</template>