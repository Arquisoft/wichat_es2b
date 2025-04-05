import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

class WeChatSimulation extends Simulation {

  // 1. HTTP Configuration
  val httpProtocol = http
    .baseUrl("http://localhost:8000") // Replace with your application's URL
    .acceptHeader("application/json, text/plain, */*")
    .acceptEncodingHeader("gzip, deflate")
    .acceptLanguageHeader("en-US,en;q=0.5")
    .userAgentHeader("Gatling/3.7.0")
    .contentTypeHeader("application/json") // Set content type for POST requests

  // 2. Scenario Definition
  val scn = scenario("WeChat User Flow")
    // 2.1. Navigate to Login Page
    .exec(http("Navigate to Login Page")
      .get("/login")
      .check(status.is(200))) // Verify successful response

    .pause(5)

    // 2.2. Attempt Login (Example - Adjust payload as needed)
    .exec(http("Login User")
      .post("/login")
      .body(StringBody("""{"username": "testuser", "password": "password123"}""")) // Replace with valid credentials
      .asJson
      .check(status.is(200))
      .check(jsonPath("$.token").exists.saveAs("authToken"))) // Extract token

    .pause(5)

    // 2.3. Navigate to Menu (Example - Requires a valid token)
    .exec(http("Navigate to Menu")
      .get("/menu")
      .header("Authorization", "Bearer ${authToken}") // Use the extracted token
      .check(status.is(200)))

    .pause(5)

    // 2.4. Example: Access Stadistics (Requires a valid token)
    .exec(http("Access Stadistics")
      .get("/stadistics")
      .header("Authorization", "Bearer ${authToken}")
      .check(status.is(200)))

    .pause(5)

  // 3. Simulation Setup
  setUp(
    scn.inject(
      rampUsers(20).during(30 seconds) // Simulate 20 users over 30 seconds
    ).protocols(httpProtocol)
  ).assertions(
    global.responseTime.max.lt(3000), // Max response time should be less than 3 seconds
    global.successfulRequests.percent.gt(95) // At least 95% of requests should be successful
  )
}