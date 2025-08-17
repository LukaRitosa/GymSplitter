<script setup>
    import { ref, computed, onMounted } from 'vue'
    import { useRouter } from 'vue-router'
    import { doc, getDoc } from 'firebase/firestore'
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
                tjedan: Math.floor(i / 7) + 1
            })
        }

        const tjedniGrupirani = dani_u_tjednu.map(dan => ({
            dan: dan,
            datumi: kalendar.filter(d => d.dan_u_tjednu === dan)
        }))

        tjedni.value = tjedniGrupirani
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

    const getTreningZaDatum = (datum) => {
        const kljuc = `Tjedan${datum.tjedan}_${datum.dan_u_tjednu}`
        return kalendar_podaci.value[kljuc] || { naziv: 'Nije postavljeno', split_dan_id: null }
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
                <div v-for="dan in tjedni" class="text-center">            
                    <div class="font-bold py-2 border-b sticky top-0 bg-white">
                        {{ dan.dan }}
                    </div>
                    <div v-for="datum in dan.datumi" class="p-2 border rounded">
                        <div class="text-sm font-medium">
                            {{ datum.dan_u_mjesecu }}.{{ datum.mjesec }}.
                        </div>
                        <div v-if="getTreningZaDatum(datum).split_dan_id !== null" 
                             class="mt-1 text-xs font-semibold p-1 rounded bg-white bg-opacity-70">
                            {{ getTreningZaDatum(datum).naziv }}
                        </div>
                        <div v-else class="mt-1 text-xs text-gray-500">
                            Odmor
                        </div>
                    </div>
                </div>
            </div>
        </div> 

    </div>
</template>