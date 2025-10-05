// Firebase configuration and utilities
class FirebaseManager {
    constructor() {
        this.db = null;
        this.initialized = false;
    }

    // Initialize Firebase (called after the modules load)
    async init() {
        if (this.initialized) return;
        
        // Wait for Firebase to be available globally
        while (!window.firestoreDb) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        this.db = window.firestoreDb;
        this.initialized = true;
        console.log('Firebase initialized successfully');
    }

    // Save data to Firestore
    async saveData(collection, docId, data) {
        await this.init();
        
        try {
            // Import functions dynamically
            const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            await setDoc(doc(this.db, collection, docId), data, { merge: true });
            console.log(`Data saved to ${collection}/${docId}`);
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    // Load data from Firestore
    async loadData(collection, docId) {
        await this.init();
        
        try {
            // Import functions dynamically
            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            const docRef = doc(this.db, collection, docId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                console.log(`Data loaded from ${collection}/${docId}`);
                return docSnap.data();
            } else {
                console.log(`No data found in ${collection}/${docId}`);
                return null;
            }
        } catch (error) {
            console.error('Error loading data:', error);
            return null;
        }
    }

    // Delete data from Firestore
    async deleteData(collection, docId) {
        await this.init();
        
        try {
            const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            await deleteDoc(doc(this.db, collection, docId));
            console.log(`Data deleted from ${collection}/${docId}`);
            return true;
        } catch (error) {
            console.error('Error deleting data:', error);
            return false;
        }
    }
}

// Create global Firebase manager instance
window.firebaseManager = new FirebaseManager();