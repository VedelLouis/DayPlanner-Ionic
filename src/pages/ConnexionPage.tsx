import React, { useState } from 'react';
import { IonPage, IonContent, IonInput, IonButton, IonImg, IonHeader, IonToolbar, IonTitle } from '@ionic/react';
import './ConnexionPage.css';
import { useHistory } from 'react-router-dom';

const ConnexionPage: React.FC = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const history = useHistory();

  const handleButtonClickLogin = async () => {
    const url = 'https://dayplanner.tech/api/?controller=connexion&action=connect';
    try {
      const formData = new URLSearchParams();
      formData.append('login', login);
      formData.append('password', password);
  
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData,
        credentials: 'include'
      });
  
      const data = await response.json();
      if (data.success === 1) {
        console.log('Connexion réussie');
        history.push('/Calendrier');
        resetLoginFields();
      } else {
        console.error('Connexion échouée:', data.message);
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error('Network error:', error);
      setErrorMessage('Erreur réseau: Impossible de se connecter à l’API');
    }
  };  

  const resetLoginFields = () => {
    setLogin('');
    setPassword('');
  };  

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Connexion</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding ion-text-center">
        <div className="container">
          <div className="login-container">
            <IonImg src='../dayPlannerLogo.png' className="logoLogin" />
            <h2>Connexion au site</h2>
            <div className="form-group">
              <IonInput type="text" value={login} onIonChange={e => setLogin(e.detail.value!)} placeholder="Login" required />
            </div>
            <div className="form-group">
              <IonInput type="password" value={password} onIonChange={e => setPassword(e.detail.value!)} placeholder="Mot de passe" required />
            </div>
            <span className='error-message-login'>{errorMessage}</span>
            <IonButton onClick={handleButtonClickLogin} expand="block" className="btn-success">Se connecter</IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ConnexionPage;