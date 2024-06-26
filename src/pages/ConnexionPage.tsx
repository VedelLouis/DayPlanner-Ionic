import React, { useState } from 'react';
import { IonPage, IonContent, IonInput, IonButton, IonImg, IonHeader, IonToolbar, IonTitle } from '@ionic/react';
import './ConnexionPage.css';
import { useHistory } from 'react-router-dom';
import { connexion } from '../repositories/ConnexionRepository';

const ConnexionPage: React.FC = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const history = useHistory();

  const handleButtonClickLogin = async () => {
    try {
      const data = await connexion(login, password);
      if (data.success === 1) {
        history.push('/Calendrier');
        resetLoginFields();
      } else {
        console.error('Connexion échouée:', data.message);
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error("Erreur réseau");
      setErrorMessage("Problème de connexion, veuillez réessayer.");
    }
  };

  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      handleButtonClickLogin();
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
              <IonInput
                className="login-input" 
                type="text"
                value={login}
                onIonChange={e => setLogin(e.detail.value!)}
                onKeyDown={handleKeyDown}
                placeholder="Login" 
                required />
            </div>
            <div className="form-group">
              <IonInput 
                className='password-input'
                type="password"
                value={password}
                onIonChange={e => setPassword(e.detail.value!)}
                onKeyDown={handleKeyDown}
                placeholder="Mot de passe" 
                required />
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
