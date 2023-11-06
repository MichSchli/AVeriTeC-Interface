#!/bin/bash

backup_dir="data/backup/mongodump-$(date +'%m/%d/%Y')"
echo "Backup dir for today: ${backup_dir}"

mongodump -d=Averitec -o=${backup_dir}