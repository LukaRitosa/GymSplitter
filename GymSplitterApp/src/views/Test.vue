<script setup>
    import { RouterLink, useRouter } from 'vue-router'
    import { useUserStore } from '@/stores/userStore'
    import { ref } from 'vue'
    import { updateDoc, doc } from "firebase/firestore"
    import { db } from '@/firebase' 



    const router=useRouter()
    const userStore=useUserStore()

    const pitanja=[
        {
            tekst:"Koliko iskustva treniranja u teretani imaš?",
            odgovori: [
                "Nikad nisam.",
                "Manje od 3 mjeseca.",
                "1-2 godine.",
                "3-5 godina.",
                "5+ godina.",        
            ] 
        },
        {
            tekst:"Koliko slobodnog vremena u tjednu imaš?",
            odgovori: [
                "1 dan",
                "2 dana",
                "3 dana",
                "4 dana",
                "5 dana",
                "6-7 dana", 
            ]
        },
    ]

    const posaljiOdgovore = async () => {
        const user= userStore.currentUser

        try{
            await updateDoc(doc(db, "users", user.uid), {
                iskustvo: odgovori.value[0],
                slobodnoVrijeme: odgovori.value[1]
            })
            router.push("/pocetna")
        }
        catch (error) {
            console.error("Greška pri spremanju:", error)
            alert("Došlo je do greške.")
        }
    }



    


    const odgovori = ref(Array(pitanja.length).fill(null))


</script>

<template>

    <div v-for="(pitanje, index) in pitanja">
        <b>
            {{ pitanje.tekst }}
        </b>

        <div v-for="(o) in pitanje.odgovori">
            <input type="radio" v-model="odgovori[index]" :value="o" :name="'pitanje'+ index"/>
            {{ o }}
        </div>
    </div>




    <button class="w-full bg-red-800 text-white rounded hover:bg-red-600 p-2 font-semibold" @click="posaljiOdgovore">
        Pošalji odgovor
    </button>






</template>