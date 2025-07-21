<script setup>
    import { RouterLink, useRouter } from 'vue-router'
    import { useUserStore } from '@/stores/userStore'
    import { ref } from 'vue'
    import { updateDoc, doc } from "firebase/firestore"



    const router=useRouter()
    const userStore=useUserStore()

    const pitanja=[
        {
            tekst:"Koliko slobodnog vremena u tjednu imaš?",
            odgovori: [
                {
                    izbor: "1 dan",
                    vrijednost: 0 
                },
                {
                    
                    izbor: "2 dana",
                    vrijednost: 1
                },
                {
                    izbor: "3 dana",
                    vrijednost: 2
                },
                {
                    izbor: "4 dana",
                    vrijednost: 3
                }, 
                {
                    izbor: "5 dana",
                    vrijednost: 4
                },
                {
                    izbor: "6-7 dana",
                    vrijednost: 5
                }
            ]
        },
        {
            tekst:"Koliko iskustva treniranja u teretani imaš?",
            odgovori: [
                {
                    izbor: "Nikad nisam.",
                    vrijednost: 0 
                },
                {
                    
                    izbor: "Manje od 3 mjeseca.",
                    vrijednost: 1
                },
                {
                    izbor: "Manje od godinu dana.",
                    vrijednost: 2
                },
                {
                    izbor: "1-2 godine.",
                    vrijednost: 3
                }, 
                {
                    izbor: "3-5 godina.",
                    vrijednost: 4
                },
                {
                    izbor: "5+ godina.",
                    vrijednost: 5
                }
            ]
        }
    ]


    await updateDoc(doc(db, "users", userCredential.user.uid), {
        iskustvo: odgovori.value[0],
        slobodnoVrijeme: odgovori.value[1]
    })


    const odgovori = ref(Array(pitanja.length).fill(null))


</script>

<template>

    <div v-for="(pitanje, index) in pitanja">
        <b>
            {{ pitanje.tekst }}
        </b>

        <div v-for="(o, i) in pitanje.odgovori">
            <input type="radio" v-model="odgovori[index]" :value="o.vrijednost" :name="'pitanje'+ index"/>
            {{ o.izbor }}
        </div>
    </div>


    <div>
        {{ odgovori[0] }}
    </div>

    


</template>