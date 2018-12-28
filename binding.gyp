{
  "targets": [
    { 
      "target_name": "helloworld",
      "include_dirs": [ "<(module_root_dir)/server/app/util/cpp" ],
      "sources": [ "<(module_root_dir)/server/app/util/cpp/helloworld.cpp" ],
      "link_settings": { "libraries": [ "-lvisa64" ], "library_dirs" : [ "<(module_root_dir)/server/app/util/cpp" ] }
    }
  ]
}