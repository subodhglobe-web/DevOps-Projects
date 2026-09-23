FROM python:3.12-slim


WORKDIR /data
COPY . /data


RUN pip3  install -r requirements.txt

CMD ["python","app-latest.py"]

EXPOSE 5000
