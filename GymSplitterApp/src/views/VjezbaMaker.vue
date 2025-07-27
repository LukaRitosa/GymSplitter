<script setup>
    import { ref } from 'vue'
    import { db } from '@/firebase'
    import { collection, addDoc } from 'firebase/firestore'
    import { RouterLink } from 'vue-router'


    const ime=ref('')
    const opis=ref('')
    const misic=ref('')
    const ostalimisici=ref([])
    const slika=ref('')

    const poruka=ref('')

    const loading = ref(false)


    const svi_misici=[
        'Prsa',  'Trapez (gornji dio leđa)', 'Lat (najširi mišić leđa)', 
        'Biceps', 'Triceps', 'Podlaktice', 'Ramena-Bočni dio', 'Ramena-Prednji dio', 'Ramena-Stražnji dio',
        'Quadriceps (Prednja loža)', 'Hamstring (Stražnja loža)',  'List', 'Gluteus (stražnjica)', 'Trbuh'
    ]

    const dodajVjezbu=async ()=>{
        loading.value=true
        try{
            
            const novaVjezba={
                naziv:ime.value,
                glavni_misic:misic.value,
                Opis: opis.value,
                ostali_misici:ostalimisici.value,
                slika: slika.value
            }
        
            await addDoc(collection(db, 'vjezbe'), novaVjezba)

            poruka.value = 'Vježba uspješno dodana'

            ime.value = ''
            opis.value = ''
            slika.value=''
            misic.value=''
            ostalimisici.value=[]
        }catch (error) {
            console.error('Greška kod dodavanja vježbe:', error)
            poruka.value = 'Došlo je do greške'
        }
        finally{
            loading.value=false
        }
    }
</script>

<template>

    <div class="p-4">
        <div >
            <RouterLink to="/admin" class="w-full bg-yellow-800 text-white rounded hover:bg-red-600 p-2 font-semibold">Nazad</RouterLink>
        </div>
        <h2 class="text-xl font-bold mb-2">Dodaj novu vježbu</h2>

        <form @submit.prevent="dodajVjezbu" class="space-y-4">

            <div>
                <label class="block">Ime vježbe:</label>
                <input type="text" v-model="ime" class="border p-1 w-full" />
            </div>
            <div>
                <label class="block">Opis:</label>
                <input type="text" v-model="opis" class="border p-1 w-full" />
            </div>
            <div>
                <label class="block">Glavni mišić:</label>
                <select v-model="misic" class="border p-1 w-full">
                    <option v-for="m in svi_misici">
                        {{ m }}
                    </option>

                </select>
            </div>
            <div>
                <label class="block">Ostali mišići:</label>
                <div class="flex flex-wrap gap-2 mt-1">
                    <label v-for="m in svi_misici">
                        <input type="checkbox" :value="m" v-model="ostalimisici" :disabled="m==misic"/>
                        {{ m }}
                    </label>
                </div>
            </div>
            <div>
                <label class="block">Slika:</label>
                <input type="text" v-model="slika" class="border p-1 w-full" />
            </div>

            <button :disabled="loading" type="submit" class="bg-green-600 hover:bg-green-400 text-white px-4 py-2 rounded">
                <span v-if="!loading">Spremi vježbu</span>
                <span v-else><img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif" class="inline w-5 h-5" /></span>
            </button>

            <div v-if="poruka" class="mt-2 text-green-600">{{ poruka }}</div>

            <img :src="slika" v-if="slika">

        </form>
        
    </div>

</template>