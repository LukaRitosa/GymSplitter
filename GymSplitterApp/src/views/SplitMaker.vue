<script setup>
    import { ref, watch, computed } from 'vue'
    import { db } from '@/firebase'
    import { collection, getDocs, addDoc } from 'firebase/firestore';

    const naziv=ref('')
    const broj_dana=ref(0)
    const vjezbe=ref([])
    const dani=ref([])
    const opis=ref('')

    const poruka = ref('')
    const loading = ref(false)

    const dohvatiVjezbe = async () => {
        const querySnapshot= await getDocs(collection(db, 'vjezbe'))
        vjezbe.value=querySnapshot.docs.map(doc => ({
            id: doc.id,
            naziv: doc.data().naziv,
            glavni_misic: doc.data().glavni_misic
        }))
    }

    const grupiraneVjezbe = computed(() => {
        const grupe = {}
        for (const v of vjezbe.value) {
            if (!grupe[v.glavni_misic]) {
                grupe[v.glavni_misic] = []
            }
            grupe[v.glavni_misic].push(v)
        }
        return grupe
    })

    dohvatiVjezbe()


    const updateDani = () => {
        dani.value = Array.from({ length: broj_dana.value }, (_, i) => ({
            dan: i + 1,
            naziv: '',
            vjezbe: [],
            setovi: {}
        }))
    }

    watch(broj_dana, updateDani)
    updateDani()

    const stvoriSplit = async () => {
        loading.value = true
        try {
            const kalendar = {}

            for (let i = 0; i < 14; i++) {
            const dummyDate = new Date(2004, 7, 6 + i) 
                .toISOString()
                .split('T')[0]

            kalendar[dummyDate] = {
                split_dan_id: null,
                naziv: "Odmor"
            }
            }

            const noviSplit = {
                naziv: naziv.value,
                broj_dana: broj_dana.value,
                opis: opis.value,
                dani: dani.value.map(dan => ({
                    ...dan,
                    setovi: dan.vjezbe.reduce((acc, vjezbaId) => {
                        acc[vjezbaId] = 1
                        return acc
                    }, {})
                })),
                kalendar: kalendar
            }

            await addDoc(collection(db, 'splits'), noviSplit)

            poruka.value = 'Split uspješno dodan'
            naziv.value = ''
            opis.value=''
            broj_dana.value = 0
            updateDani()
        } catch (error) {
            console.error('Greška:', error)
            poruka.value = 'Greška pri spremanju.'
        }
        finally{
            loading.value = false
        }
    
    }
 


</script>

<template>
    
    <div class="min-h-screen flex items-center justify-center bg-red-900 text-white px-4">

        <div>
            <RouterLink to="/admin" class="w-full bg-red-800 text-white rounded hover:bg-red-400 p-2 font-semibold ">
                Nazad
            </RouterLink>

            <h2 class="text-xl font-bold my-4">Kreiraj novi Split</h2>

            <div class="mb-3">
                <label class="block font-semibold">Naziv splita:</label>
                <input v-model="naziv" class="border p-1 w-full" type="text" />
            </div>

            <div class="mb-3">
                <label class="block font-semibold">Opis:</label>
                <input v-model="opis" class="border p-1 w-full" type="text" />
            </div>

            <div class="mb-3">
                <label class="block font-semibold">Broj dana:</label>
                <input v-model.number="broj_dana" class="border p-1 w-full" type="number" min="1" max="7" />
            </div>

            <div v-for="(dan, index) in dani" >
                <h3 class="font-bold mb-2">Dan {{ dan.dan }}</h3>

                <label class="block">Naziv dana:</label>
                <input v-model="dan.naziv" class="border p-1 w-full mb-2" type="text" placeholder="npr. Push" />
                
                <label class="block mb-1">Odaberi vježbe:</label>
                <div v-for="(grupa, misic) in grupiraneVjezbe" :key="misic">
                    <div class="flex flex-wrap gap-2">
                        <h4 class="font-semibold mb-1">{{ misic }}</h4>
                        <label v-for="v in grupa" :key="v.id" class="inline-flex items-center gap-1">
                            <input type="checkbox" :value="v.id" v-model="dan.vjezbe"/>
                            {{ v.naziv }}
                        </label>
                    </div>
                </div>


            </div>

            <button :disabled="loading" @click="stvoriSplit" class="bg-red-600 hover:bg-red-400 text-white px-4 py-2 rounded mt-2">
                <span v-if="!loading">Spremi Split</span>
                <span v-else><img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif" class="inline w-5 h-5" /></span>
            </button>
            
            <div v-if="poruka" class="mt-2 text-green-700">{{ poruka }}</div>

        </div>
    </div>


</template>