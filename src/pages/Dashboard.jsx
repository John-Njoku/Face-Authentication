import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, signOut, deleteUser } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'; // Import updateDoc and deleteDoc from Firestore
import { db } from '../firebase';

const Dashboard = () => {
  const [user, setUser] = useState(null); // State to store user data
  const [loading, setLoading] = useState(true); // State to track loading status
  const [photoURL, setPhotoURL] = useState('https://via.placeholder.com/150'); // State for user's profile photo

  // Fetch user data from Firestore when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data());
            if (userDoc.data().photoURL) {
              setPhotoURL(userDoc.data().photoURL);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        console.error("No authenticated user found.");
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  // Function to sign out the user
  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        window.location.href = '/';
      })
      .catch((error) => {
        console.error('Sign out error:', error);
      });
  };

  // Function to handle profile photo upload
  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const storage = getStorage();
    const storageRef = ref(storage, `users/${user.uid}/profile.jpg`);

    try {
      await uploadBytes(storageRef, file);
      console.log('Uploaded a file!');

      const downloadURL = await getDownloadURL(storageRef);
      setPhotoURL(downloadURL);

      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { photoURL: downloadURL });

      console.log('Photo URL updated successfully in Firestore!');
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
  };

  // Function to handle account deletion
  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const auth = getAuth();
        const storage = getStorage();
        const currentUser = auth.currentUser;

        // Delete the user's data from Firestore
        await deleteDoc(doc(db, 'users', currentUser.uid));
        console.log('User data deleted from Firestore.');

        // Delete the user's profile photo from Firebase Storage (if exists)
        const photoRef = ref(storage, `users/${currentUser.uid}/profile.jpg`);
        await deleteObject(photoRef);
        console.log('User profile photo deleted from Storage.');

        // Delete the user's authentication account
        await deleteUser(currentUser);
        console.log('User account deleted from Authentication.');

        // Redirect to home page
        window.location.href = '/';
      } catch (error) {
        console.error('Error deleting user account:', error);
        alert('Failed to delete account. Please try again.');
      }
    }
  };

  // Conditional rendering for loading state and user data availability
  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <p>No user data found. Please sign in again.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <nav className="flex space-x-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
            <Link to="/profile" className="text-gray-600 hover:text-gray-900">Profile</Link>
            <button onClick={handleSignOut} className="text-red-600 hover:text-red-800">Sign Out</button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome Back, {user.fullName}. You are now on your dashboard.
        </h1>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-grow md:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6 text-center">
                <div className="w-40 h-40 rounded-full bg-gray-200 mx-auto mb-4 overflow-hidden">
                  <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Upload New Photo
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">User Information</h2>
                  <div className="space-y-2">
                    <p><strong>Full Name:</strong> {user.fullName}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Phone:</strong> {user.phone}</p>
                    <p><strong>Address:</strong> {user.address}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <button 
                  onClick={handleDeleteAccount}
                  className="py-3 px-6 rounded-md bg-red-500 text-white text-lg font-semibold shadow-md hover:bg-red-700"
                >
                  Delete My Account
                </button>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/3 flex-shrink-0">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <ul className="space-y-2">
                <li>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                    Edit Profile
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                    View Analytics
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                    Manage Content
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                    Settings
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
