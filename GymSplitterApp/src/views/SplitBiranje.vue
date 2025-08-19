<script setup>
    import { RouterLink, useRouter } from 'vue-router'
    import { ref, onMounted, computed } from 'vue'
    import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore'
    import { useUserStore } from '@/stores/userStore'
    import { db } from '@/firebase'

    const userStore= useUserStore()
    const splits=ref([])
    const router=useRouter()
    const loading=ref(false)

    const splitovi_ucitani=ref(false)

    const userData=ref(null)


    const dohvatiSplitove = async () => {
        const snapshot = await getDocs(collection(db, 'splits'))
        splits.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        splitovi_ucitani.value=true
    }

    const dohvatiKorisnika= async() => {
        const userDocRef = doc(db, `users/${userStore.currentUser.uid}`)
        const userSnap = await getDoc(userDocRef)

        if (userSnap.exists()) {
            userData.value = userSnap.data()
        }
    }

    const preporuceniSplitovi= computed (() => {
        if (!userData.value?.slobodni_dani || !splitovi_ucitani.value) return []

        const brojSlobodnihDana = userData.value.slobodni_dani.length

        return splits.value.filter(split => {
            if (split.broj_dana === brojSlobodnihDana) return true

            if (split.broj_dana == brojSlobodnihDana) {
                return true
            }
            return false
        }).sort((a, b) => a.broj_dana - b.broj_dana)
    })

    

    const ostaliSplitovi = computed(() => {
        if (!userData.value?.slobodni_dani) return splits.value
        return splits.value.filter(split => !preporuceniSplitovi.value.includes(split))
    })

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
    
    onMounted(async () => {
        await dohvatiKorisnika()
        await dohvatiSplitove()
    })

</script>

<template>

    <div v-if="!loading">

        <div v-if="preporuceniSplitovi.length > 0">
            <h2 class="text-2xl font-bold mb-4">Preporučeni splitovi</h2>
            
            <div v-for="split in preporuceniSplitovi" class="border rounded p-4 mb-4 shadow bg-blue-50">
                <h3 class="text-xl font-semibold">{{ split.naziv }}</h3>
                <p>Broj dana: {{ split.broj_dana }}</p>
                
                <ul class="mt-2 list-disc pl-5 text-sm text-gray-700">
                    <li v-for="dan in split.dani" :key="dan.dan">
                        Dan {{ dan.dan }} – {{ dan.naziv }} ({{ dan.vjezbe.length }} vježbi)
                    </li>
                </ul>

                <button @click="odaberiSplit(split)" class="mt-3 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded">
                    Odaberi ovaj Split
                </button>
            </div>

        </div>

        <div>
            <h2 class="text-2xl font-bold mb-4">Splitovi</h2>
            <div v-for="split in ostaliSplitovi" class="border rounded p-4 mb-4 shadow">
                <h3 class="text-xl font-semibold">{{ split.naziv }}</h3>
                <p>Broj dana: {{ split.broj_dana }}</p>

                <ul class="mt-2 list-disc pl-5 text-sm text-gray-700">
                    <li v-for="dan in split.dani" :key="dan.dan">
                    Dan {{ dan.dan }} – {{ dan.naziv }} ({{ dan.vjezbe.length }} vježbi)
                    </li>
                </ul>

                <button @click="odaberiSplit(split)" class="mt-3 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded">
                    <span>
                        Odaberi ovaj Split
                    </span>
                    
                </button>
            </div>
        </div>
    </div>
    
    <div v-else>
        <img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif" class="inline w-5 h-5" />
    </div>

</template>