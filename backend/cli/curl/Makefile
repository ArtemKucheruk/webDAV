BASE_URL ?= http://127.0.0.1:8080/api
COOKIE_JAR ?= cookies.txt

.PHONY: ping register login logout deactivate list upload delete download

ping:
	curl -s $(BASE_URL)/health/ping -w "\nHTTP %{http_code}\n"

register:
	curl -s -c $(COOKIE_JAR) -X POST $(BASE_URL)/user/create \
		-H "Content-Type: application/json" \
		-d '{"email":"$(EMAIL)","password":"$(PASSWORD)"}' \
		-w "\nHTTP %{http_code}\n"

login:
	curl -s -c $(COOKIE_JAR) -X POST $(BASE_URL)/user/login \
		-H "Content-Type: application/json" \
		-d '{"email":"$(EMAIL)","password":"$(PASSWORD)"}' \
		-w "\nHTTP %{http_code}\n"

logout:
	curl -s -b $(COOKIE_JAR) -X POST $(BASE_URL)/user/logout \
		-w "\nHTTP %{http_code}\n"

me:
	curl -s -b $(COOKIE_JAR) $(BASE_URL)/user/me \
		-w "\nHTTP %{http_code}\n"

change-password:
	curl -s -b $(COOKIE_JAR) -X PATCH $(BASE_URL)/user/settings/change_password \
		-H "Content-Type: application/json" \
		-d '{"old_password":"$(OLD_PASSWORD)","password":"$(NEW_PASSWORD)"}' \
		-w "\nHTTP %{http_code}\n"

deactivate:
	curl -s -b $(COOKIE_JAR) -X POST $(BASE_URL)/user/settings/deactivate \
		-w "\nHTTP %{http_code}\n"


list:
	curl -s -b $(COOKIE_JAR) $(BASE_URL)/file/get_all \
		-w "\nHTTP %{http_code}\n"

upload:
	curl -s -b $(COOKIE_JAR) -X POST $(BASE_URL)/file/upload \
		-F "file=@$(FILE)" \
		-w "\nHTTP %{http_code}\n"

delete:
	curl -s -b $(COOKIE_JAR) -X POST $(BASE_URL)/file/delete \
		-H "Content-Type: application/json" \
		-d '{"file_id":$(FILE_ID)}' \
		-w "\nHTTP %{http_code}\n"

download:
	curl -s -b $(COOKIE_JAR) "$(BASE_URL)/file/download?file_id=$(FILE_ID)" \
		-o $(OUT) \
		-w "\nHTTP %{http_code}\n"
