<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/shorodokvlad/spring-ecommerce-app">
    <img src="client/public/cart.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Ecommerce App</h3>

  <p align="center">
    A comprehensive full-stack Ecommerce Application built with Spring Boot and React.
    <br />
  </p>
</div>

<!-- ABOUT THE PROJECT -->
## About The Project
![Screenshot](client/public/assets/HomePage.png)
This is a complete E-commerce application featuring a Java Spring Boot backend and a React frontend. The application allows users to browse products, manage their shopping carts, process orders, and manage authentication securely.

Key features include:
* Full user authentication and authorization utilizing JSON Web Tokens (JWT)
* Product catalog and state persistence managed via a Supabase-hosted PostgreSQL database
* Seamless integration with Amazon Web Services (AWS) S3 for scalable media and image storage
* Interactive frontend built with React, styled effectively for eCommerce usage
* Containerized backend with a CI/CD pipeline (GitHub Actions → GitHub Container Registry) and Kubernetes manifests for one-command deployment to any cluster

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [![Spring Boot][SpringBoot-shield]][SpringBoot-url]
* [![React][React-shield]][React-url]
* [![PostgreSQL][PostgreSQL-shield]][PostgreSQL-url]
* [![Supabase][Supabase-shield]][Supabase-url]
* [![AWS S3][AWS-shield]][AWS-url]
* [![Docker][Docker-shield]][Docker-url]
* [![Kubernetes][Kubernetes-shield]][Kubernetes-url]
* [![GitHub Actions][GHActions-shield]][GHActions-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

Follow these instructions to get a copy of the project up and running locally for development and testing.

### Prerequisites

You need to install the following on your machine:
* **Java 17** (or compatible JDK version)
* **Node.js** and **npm**

You also need a free [Supabase](https://supabase.com/) account — the database is a managed PostgreSQL instance, so nothing runs locally. Maven is not required (the project ships with the Maven wrapper).

### Installation

1. **Clone the repository**
   ```sh
   git clone https://github.com/shorodokvlad/spring-ecommerce-app.git
   ```
2. **Setup the Database**
   * Create a new Supabase project.
   * In the project dashboard, click **Connect** and copy the **Session pooler** connection details (host, port `5432`, user).
   * No schema setup is needed — Hibernate creates the tables automatically on first startup.
3. **Configure the Backend**
   * Create `src/main/resources/application-local.properties` (gitignored) with your credentials:
     ```properties
     SUPABASE_DB_URL=jdbc:postgresql://<session-pooler-host>:5432/postgres
     SUPABASE_DB_USER=postgres.<your-project-ref>
     SUPABASE_DB_PASSWORD=<your-db-password>
     JWT_SECRET=<any long random string>
     aws.s3.access=<aws key, optional>
     aws.s3.secrete=<aws secret, optional>
     ```
4. **Run the Backend**
   * From the root directory, use the Maven wrapper with the `local` profile:
     ```sh
     ./mvnw spring-boot:run -Dspring-boot.run.profiles=local
     ```
   * The backend API server will start on port `2424`.
5. **Install Frontend Dependencies**
   * Open a new terminal and navigate to the `client` directory:
     ```sh
     cd client
     npm install
     ```
6. **Start the Frontend**
   * Launch the development server:
     ```sh
     npm start
     ```
   * Your browser should automatically open `http://localhost:3000`.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->
## Usage

Once both servers are running:
* **Customers** can register, log in, view items across different categories, and add items to the cart.
* State management retains the cart across navigation, while HTTP API calls persist real order information securely in PostgreSQL.
* Uploaded products are instantly managed on AWS S3 to optimize performance.

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- DEPLOYMENT -->
## Deployment

The backend is fully containerized and cloud-ready:

* **Docker** — a multi-stage [`Dockerfile`](Dockerfile) builds the app and packages it into a slim JRE image running as a non-root user.
* **CI/CD** — on every push to `main`, a [GitHub Actions workflow](.github/workflows/deploy.yml) builds the image and publishes it to GitHub Container Registry as `ghcr.io/shorodokvlad/spring-ecommerce-app` (tagged `latest` and by commit SHA).
* **Kubernetes** — the [`k8s/`](k8s/) folder contains production-style manifests: Deployment (replicas, health probes, resource limits), Service, Ingress, ConfigMap, Secret template, and a HorizontalPodAutoscaler (2–5 pods based on CPU). The app is stateless — all state lives in Supabase and S3 — so it scales horizontally out of the box.

Deploying to any cluster takes two commands:

```sh
kubectl create secret generic ecommerce-secrets --from-literal=...   # see k8s/secret.example.yaml
kubectl apply -f k8s/
```

See [`k8s/README.md`](k8s/README.md) for the full architecture diagram and instructions.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.md` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

Vladislav Shorodok - [@shorodokvlad](https://twitter.com/shorodokvlad) - vlad.shorodoc@gmail.com

Project Link: [https://github.com/shorodokvlad/spring-ecommerce-app](https://github.com/shorodokvlad/spring-ecommerce-app)

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- MARKDOWN LINKS & IMAGES -->
[SpringBoot-shield]: https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white
[SpringBoot-url]: https://spring.io/projects/spring-boot
[React-shield]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[PostgreSQL-shield]: https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white
[PostgreSQL-url]: https://www.postgresql.org/
[Supabase-shield]: https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white
[Supabase-url]: https://supabase.com/
[Docker-shield]: https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white
[Docker-url]: https://www.docker.com/
[Kubernetes-shield]: https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white
[Kubernetes-url]: https://kubernetes.io/
[GHActions-shield]: https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white
[GHActions-url]: https://github.com/features/actions
[AWS-shield]: https://img.shields.io/badge/Amazon_AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white
[AWS-url]: https://aws.amazon.com/
