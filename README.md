<div align="center">
  
  [![Actions Status](https://github.com/arquisoft/wichat_es2b/workflows/CI%20for%20wichat_es2b/badge.svg)](https://github.com/arquisoft/wichat_es2b/actions)
  [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Arquisoft_wichat_es2b&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Arquisoft_wichat_es2b)
  [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=Arquisoft_wichat_es2b&metric=coverage)](https://sonarcloud.io/summary/new_code?id=Arquisoft_wichat_es2b)
  
  ![Logo](/docs/images/Logotipo_Wechat_mini.png)

</div>

This is a base project for the Software Architecture course in 2024/2025. It is a basic application composed of several components.

- **User service**. Express service that handles the insertion of new users in the system.
- **Auth service**. Express service that handles the authentication of users.
- **LLM service**. Express service that handles the communication with the LLM.
- **Gateway service**. Express service that is exposed to the public and serves as a proxy to the two previous ones.
- **Webapp**. React web application that uses the gateway service to allow basic login and new user features.

Both the user and auth service share a Mongo database that is accessed with mongoose.

## Members
<table>
  <tr>
    <th>Contributor 👤</th>
    <th>Contact 📞</th>
    <th colspan="4">Self reports ✒️</th>
  </tr>
  <tr>
    <td>Leonardo Carone Menes</td>
    <td><a href="https://github.com/UnioviLCM27">Leonardo's github</a></td>
    <td><a href="https://github.com/Arquisoft/wichat_es2b/issues/34">Self report 1</a></td>
    <td><a href="https://github.com/Arquisoft/wichat_es2b/issues/100">Self report 2</a></td>
    <td><a href="https://github.com/Arquisoft/wichat_es2b/issues/175">Self report 3</a></td>
    <td><a href="...">Self report 4</a></td>
  </tr>
  <tr>
    <td>José Martínez de Zuvillaga</td>
    <td><a href="https://github.com/josemzuvi">José's github</a></td>
    <td><a href="https://github.com/Arquisoft/wichat_es2b/issues/42">Self report 1</a></td>
    <td><a href="https://github.com/Arquisoft/wichat_es2b/issues/101">Self report 2</a></td>
    <td><a href="https://github.com/Arquisoft/wichat_es2b/issues/178">Self report 3</a></td>
    <td><a href="...">Self report 4</a></td>
  </tr>
  <tr>
    <td>Ignacio Fernández Suárez</td>
    <td><a href="https://github.com/nack-fs">Ignacio's github</a></td>
    <td><a href="https://github.com/Arquisoft/wichat_es2b/issues/30">Self report 1</a></td>
    <td><a href="https://github.com/Arquisoft/wichat_es2b/issues/98">Self report 2</a></td>
    <td><a href="https://github.com/Arquisoft/wichat_es2b/issues/179">Self report 3</a></td>
    <td><a href="...">Self report 4</a></td>
  </tr>
  <tr>
    <td>Miguel Fernández Huerta</td>
    <td><a href="https://github.com/MigFeH">Miguel's github</a></td>
    <td><a href="https://github.com/Arquisoft/wichat_es2b/issues/28">Self report 1</a></td>
    <td><a href="https://github.com/Arquisoft/wichat_es2b/issues/95">Self report 2</a></td>
    <td><a href="https://github.com/Arquisoft/wichat_es2b/issues/104">Self report 3</a></td>
    <td><a href="...">Self report 4</a></td>
  </tr>
  <tr>
    <td>Daniel González Pérez</td>
    <td><a href="https://github.com/danigpt">Daniel's github</a></td>
    <td><a href="https://github.com/Arquisoft/wichat_es2b/issues/45">Self report 1</a></td>
    <td><a href="https://github.com/Arquisoft/wichat_es2b/issues/102">Self report 2</a></td>
    <td><a href="...">Self report 3</a></td>
    <td><a href="...">Self report 4</a></td>
  </tr>
</table>
