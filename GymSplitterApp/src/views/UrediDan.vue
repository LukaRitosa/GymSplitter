<script setup>
import { ref, onMounted } from 'vue'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useUserStore } from '@/stores/userStore'
import { useRoute } from 'vue-router'

const route = useRoute()
const userStore = useUserStore()

const danId = Number(route.params.danId)
const trenutniSplitId = ref(null)
const danPodaci = ref({})
const vjezbe = ref([])
const noviBrojSetova=ref(0)

const loading = ref(false)
const detalji=ref(false)
const promjena=ref(false)

const dohvatiSplit = async () => {
  try {
    loading.value = true

    const userDocRef = doc(db, `users/${userStore.currentUser.uid}`)
    const userSnap = await getDoc(userDocRef)
    if (userSnap.exists()) {
      trenutniSplitId.value = userSnap.data().trenutniSplit
    }
  } catch (error) {
    console.error("Greška:", error)
  }
}

const dohvatiDan = async () => {
  try {

    const splitRef = doc(db, `users/${userStore.currentUser.uid}/splits/${trenutniSplitId.value}`)
    const splitSnap = await getDoc(splitRef)
    if (splitSnap.exists()) {
      const splitData = splitSnap.data()
      
      const odabraniDan = splitData.dani?.find(d => d.dan === danId)
      if (odabraniDan) {
        danPodaci.value = odabraniDan
        await dohvatiVjezbe(odabraniDan.vjezbe || [])
      }
    }
  } catch (error) {
    console.error("Greška:", error)
  }
}

const dohvatiVjezbe = async (vjezbeIds) => {
  try {
    const rez = []
    for (const id of vjezbeIds) {
      const vjezbaRef = doc(db, 'vjezbe', id)
      const vjezbaSnap = await getDoc(vjezbaRef)
      if (vjezbaSnap.exists()) {
        rez.push({
          id,
          naziv: vjezbaSnap.data().naziv,
          opis: vjezbaSnap.data().Opis,
          slika: vjezbaSnap.data().slika,
          glavni_misic: vjezbaSnap.data().glavni_misic,
          ostali_misici: vjezbaSnap.data().ostali_misici || [],
          brojSetova: danPodaci.value.setovi?.[id] || 1
        })
      }
    }
    vjezbe.value = rez
  } catch (error) {
    console.error("Greška pri dohvaćanju vježbi:", error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await dohvatiSplit()
  await dohvatiDan()
})
</script>

<template>
  <div v-if="!loading && !detalji">
    <h2 class="text-xl font-bold mb-4">{{ danPodaci.naziv || 'Nepoznat dan' }}</h2>
    
    <ul class="space-y-4">
      <li v-for="v in vjezbe" :key="v.id" class="border p-4 rounded-lg">
        <h3 class="font-semibold text-lg">{{ v.naziv }}</h3>
        <img :src="v.slika" :alt="v.naziv" class="my-2 max-w-full h-auto rounded">
        <p class="text-gray-700">{{ v.opis }}</p>
        
        <div class="mt-2">
            <p>Glavni mišić: {{ v.glavni_misic }}</p>
            <p v-if="v.ostali_misici?.length">
                Ostali mišići: {{ v.ostali_misici.join(', ') }}
            </p>
            <p class="mt-2 font-medium">
                Broj setova: 
                <button class="border bg-red-500 text-white hover:bg-red-300 p-2">
                    -
                </button>{{ v.brojSetova }}
                <button class="border bg-red-500 text-white hover:bg-red-300 p-2">
                    +
                </button>
            </p>
            <button class="border bg-black text-white hover:bg-red-800 p-2">
                ukloni vježbu
            </button>
        </div>
      </li>
      <button class="border bg-blue-500 text-white hover:bg-blue-300 p-2">
        dodaj vježbu
      </button>
    </ul>
    <button v-if="promjena" class="border bg-red-500 text-white hover:bg-red-300 p-2">
        spremi promjene
    </button>
  </div>
  
  <div v-else>
    <img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif"/>
  </div>

  <div v-if="detalji">
    detalji
  </div>

  
</template>