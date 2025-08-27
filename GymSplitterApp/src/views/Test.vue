<script setup>
    import { RouterLink, useRouter } from 'vue-router'
    import { useUserStore } from '@/stores/userStore'
    import { ref, computed } from 'vue'
    import { updateDoc, doc } from "firebase/firestore"
    import { db } from '@/firebase' 



    const router=useRouter()
    const userStore=useUserStore()

    const loading=ref(false)

    const dani_u_tjednu=[
        'ponedjeljak',  'utorak', 'srijeda', 'četvrtak', 'petak', 'subota', 'nedjelja', 
    ]

    const pitanja=[
       {
            tekst: "Koji su ti slobodni dani?",
            odgovori: dani_u_tjednu,
            tip: 'checkbox'
        },
    ]

    const brojSlobodnihDana = computed(() => {
        return odgovori.value.length
    })

    const posaljiOdgovore = async () => {
        loading.value=true
        const user= userStore.currentUser

        try{
            await updateDoc(doc(db, "users", user.uid), {
                slobodni_dani: odgovori.value,
                slobodnoVrijeme: `${brojSlobodnihDana.value} ${brojSlobodnihDana.value===1 ? 'dan' : 'dana'}`
            })
            router.push("/pocetna")
        }
        catch (error) {
            console.error("Greška pri spremanju:", error)
            alert("Došlo je do greške.")
        }
        finally{
            loading.value=false
        }
    }    


    const odgovori= ref([])


</script>

<template>

    <div class="min-h-screen flex items-center justify-center bg-red-200 text-red-900 px-4">

        <div>

            <div class="m-4">
                <RouterLink to="/pocetna" class="w-full bg-red-400 text-white rounded hover:bg-red-300 p-2 font-semibold"> Početna</RouterLink>
            </div>


            <div v-for="p in pitanja" class="font-semibold">
                <h3>
                    <b>{{ p.tekst }}</b>    
                </h3>
                <p> <b>Odabrano dana:</b> {{ brojSlobodnihDana }}</p>
                <div v-for="(dan, idx) in p.odgovori" class="my-2">
                    <input type="checkbox" v-model="odgovori" :value="dan"/>
                    <label :for="'dan_' + idx">{{ dan }}</label>
                </div>
            </div>


            <button :disabled="loading" class="w-full bg-red-800 text-white rounded hover:bg-red-600 p-2 font-semibold" @click="posaljiOdgovore">
                <span v-if="!loading">Pošalji odgovor</span>
                <span v-else><img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif" class="inline w-5 h-5" /></span>
            </button>
        
        </div>
    
    </div>

</template>