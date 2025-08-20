<script setup>
    import { ref, computed, onMounted } from 'vue'
    import { useRouter } from 'vue-router'
    import { doc, getDoc, updateDoc } from 'firebase/firestore'
    import { db } from '@/firebase'
    import { useUserStore } from '@/stores/userStore'

    const router = useRouter()
    const userStore = useUserStore()
    const kalendar_podaci = ref({})
    const loading = ref(true)

    const dani_u_tjednu=[
        'Nedjelja', 'Ponedjeljak',  'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota',  
    ]

    const tjedni=ref([])

    const danasnji_dan= new Date()


    const generirajKalendar = () => {
        loading.value = true
        const danas = new Date()
        const kalendar = []
    

        for (let i = 0; i < 14; i++) {
            const datum = new Date(danas)
            datum.setDate(danas.getDate() + i)

            kalendar.push({
                datum: datum,
                dan_u_tjednu: dani_u_tjednu[datum.getDay()], 
                dan_u_mjesecu: datum.getDate(),
                mjesec: datum.getMonth() + 1,
                godina: datum.getFullYear(),
                tjedan: Math.floor(i / 7) + 1,
            })
        }
    
    tjedni.value = kalendar;
    loading.value = false;

    }

    const dohvatiKalendar = async () => {
        try {
            const userDocRef = doc(db, `users/${userStore.currentUser.uid}`)
            const userSnap = await getDoc(userDocRef)
            
            if (userSnap.exists()) {
                kalendar_podaci.value = userSnap.data().kalendar || {}
            }
        } catch (error) {
            console.error("Greška pri dohvaćanju kalendara:", error)
        } finally {
            loading.value = false
        }
    }

    const getTreningZaDatum = (index) => {
        const kljuc = String(index) 
        return kalendar_podaci.value[kljuc] || { naziv: 'Nije postavljeno', split_dan_id: null }
    }


    const postaviOdmor = async (kliknutiDan) => {
        loading.value = true
        try {
            const userDocRef = doc(db, `users/${userStore.currentUser.uid}`)
            const snap = await getDoc(userDocRef)
            if (!snap.exists()) return

            const userData = snap.data()
            const original = { ...(userData.kalendar || {}) }
            const kalendar = { ...(userData.kalendar || {}) }

            if (!kalendar[kliknutiDan]) return


            const sviDani = Object.keys(original).filter(k => !isNaN(k)).map(k => Number(k)).sort((a, b) => a - b)

            const radniDani = sviDani.filter(d => original[d].split_dan_id !== null)

            const pozicija = radniDani.indexOf(kliknutiDan)

            const originalniId = radniDani.map(d => original[d].split_dan_id)

            kalendar[kliknutiDan] = {
                ...kalendar[kliknutiDan],
                split_dan_id: null,
                naziv: 'Odmor',
            }

            for (let i = pozicija + 1; i < radniDani.length; i++) {
                const trenutniDan = radniDani[i]
                const noviId = originalniId[i - 1]
                kalendar[trenutniDan] = {
                    ...kalendar[trenutniDan],
                    split_dan_id: noviId,
                    naziv: String(noviId),
                }
            }

            await updateDoc(userDocRef, { kalendar })

            kalendar_podaci.value = kalendar

        } catch (e) {            
            console.error('Greška:', e)

        } finally {
            loading.value = false
        }
    }







    onMounted(async () => {
        generirajKalendar()
        await dohvatiKalendar()
    })


</script>

<template>
    <div>
        <div v-if="loading">
            <img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif" class="h-full" />
        </div>

        <div v-else class="overflow-x-auto">
            <h3 class="text-xl font-bold">Kalendar</h3>

            <div class="grid grid-cols-7 gap-2 min-w-max">
                <div v-for="(datum, index) in tjedni" class="text-center">           
                    <div class="font-bold py-2 border-b sticky top-0 bg-white">
                        {{ datum.dan_u_tjednu }}
                    </div>
                    <div class="text-sm font-medium">
                        {{ datum.dan_u_mjesecu }}.{{ datum.mjesec }}.
                    </div>
                    <div v-if="getTreningZaDatum(index).split_dan_id !== null" 
                            class="mt-1 text-xs font-semibold p-1 rounded bg-white bg-opacity-70">
                        {{ getTreningZaDatum( index).naziv }}

                        <div>
                            <button class="border bg-gray-500 text-white hover:bg-gray-300 p-2" @click="postaviOdmor(index)">
                                Odmor
                            </button>
                        </div>

                        <div>
                            <button class="border bg-red-500 text-white hover:bg-red-300 p-2">
                                Preskoči
                            </button>
                        </div>
                        

                        
                        
                    </div>
                    <div v-else class="mt-1 text-xs text-gray-500">
                        Odmor
                        <div>
                            <button class="border bg-blue-500 text-white hover:bg-blue-300 p-2">
                                Otkaži odmor
                            </button> 
                        </div>
                        
                    </div>
                </div>
            </div>
        </div> 

    </div>
</template>