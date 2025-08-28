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
        loading.value=true

        const snapshot = await getDocs(collection(db, 'splits'))
        splits.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        splitovi_ucitani.value=true

        loading.value=false
    }

    const dohvatiKorisnika= async() => {
        loading.value=true

        const userDocRef = doc(db, `users/${userStore.currentUser.uid}`)
        const userSnap = await getDoc(userDocRef)

        if (userSnap.exists()) {
            userData.value = userSnap.data()
        }

        loading.value=false
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
        loading.value = true

        try {
            const userDocRef = doc(db, `users/${userStore.currentUser.uid}`)
            const userSnap = await getDoc(userDocRef)

            if (!userSnap.exists()) {
                alert("Korisnički podaci nisu pronađeni")
                return
            }

            const userData = userSnap.data()
            const slobodniDani = userData.slobodni_dani || []

            const split_kopija = JSON.parse(JSON.stringify(split))

            const kalendar = {}
            let trenutniDanSplita = 0

            const danas = new Date()

            for (let i = 0; i < 14; i++) {
                const datum = new Date(danas)
                datum.setDate(danas.getDate() + i)
                const datumISO = datum.toLocaleDateString("sv-SE") 
                const danUTjednu = datum.toLocaleDateString("hr-HR", { weekday: "long" })

                if (slobodniDani.includes(danUTjednu)) {
                    const danSplita = split_kopija.dani[trenutniDanSplita % split_kopija.broj_dana]

                    kalendar[datumISO] = {
                        split_dan_id: danSplita.dan,
                        naziv: danSplita.naziv
                    }

                    trenutniDanSplita++
                } else {
                    kalendar[datumISO] = {
                        split_dan_id: null,
                        naziv: "Odmor"
                    }
                }
            }

            split_kopija.kalendar = kalendar

            const userSplitRef = doc(db, `users/${userStore.currentUser.uid}/splits/${split.id}`)
            await setDoc(userSplitRef, split_kopija)

            await setDoc(userDocRef, {
                trenutniSplit: split.id
            }, { merge: true })


            router.push("/Split")
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

    <div class="m-4">
        <RouterLink to="/UserSplitovi" class="w-full bg-red-800 text-white rounded hover:bg-red-600 p-2 font-semibold">Nazad</RouterLink>
    </div>

    <div v-if="!loading" class="flex justify-center items-center min-h-screen flex-col">

        <div v-if="preporuceniSplitovi.length > 0">
            <h2 class="text-2xl font-bold mb-4 text-center">
                Preporučeni splitovi
            </h2>

            <hr class="border-red-700 w-1/2 mx-auto mb-6" />
           
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="split in preporuceniSplitovi" class="text-center flex flex-col items-center border rounded p-4 mb-4 shadow bg-red-50">
                    <h3 class="text-xl font-semibold">{{ split.naziv }}</h3>
                    <p>Broj dana: {{ split.broj_dana }}</p>
                    <p>Opis: {{ split.opis }}</p>
                    
                    <ul class="mt-2 list-disc pl-5 text-sm text-gray-700">
                        <li v-for="dan in split.dani" :key="dan.dan">
                            Dan {{ dan.dan }} – {{ dan.naziv }} ({{ dan.vjezbe.length }} vježbi)
                        </li>
                    </ul>

                    <button @click="odaberiSplit(split)" class="mt-3 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded">
                        Odaberi ovaj Split
                    </button>
                </div>
            </div>
        </div>

        <div>
            <h2 class="text-2xl font-bold mb-4 text-center">
                Splitovi
            </h2>

            <hr class="border-black-600 w-1/2 mx-auto mb-6" />

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                <div v-for="split in ostaliSplitovi" class="border rounded p-4 mb-4 shadow text-center flex flex-col items-center">
                    <h3 class="text-xl font-semibold">{{ split.naziv }}</h3>
                    <p>Broj dana: {{ split.broj_dana }}</p>
                    <p>Opis: {{ split.opis }}</p>

                    <ul class="mt-2 list-disc pl-5 text-sm text-gray-700">
                        <li v-for="dan in split.dani" :key="dan.dan">
                        Dan {{ dan.dan }} – {{ dan.naziv }} ({{ dan.vjezbe.length }} vježbi)
                        </li>
                    </ul>

                    <button @click="odaberiSplit(split)" class="mt-3 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded">
                        <span>
                            Odaberi ovaj Split
                        </span>
                        
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <div v-else class="min-h-screen flex flex-col items-center px-4 justify-center">
        <img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif"/>
    </div>

</template>