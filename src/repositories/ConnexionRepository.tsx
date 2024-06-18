// Repository contenant les requêtes relatives à la connexion

export const connexion = async (login: string, password: string): Promise<any> => {
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
    return data;
  } catch (error) {
    throw new Error('Erreur réseau: Impossible de se connecter à l’API');
  }
};

export const deconnexion = async (): Promise<void> => {
  const url = 'https://dayplanner.tech/api/?controller=connexion&action=deconnect';
  try {
    await fetch(url, {
      method: 'GET'
    });
  } catch (error) {
    throw new Error('Erreur réseau: Impossible de se déconnecter');
  }
};
