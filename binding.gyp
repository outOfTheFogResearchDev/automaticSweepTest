{
  "targets": [
    { 
      "target_name": "rfOn",
      "include_dirs": [ "<(module_root_dir)/server/app/util/cpp" ],
      "sources": [ "<(module_root_dir)/server/app/util/cpp/rfOn.cpp" ],
      "link_settings": { "libraries": [ "-lvisa64" ], "library_dirs" : [ "<(module_root_dir)/server/app/util/cpp" ] }
    },
    { 
      "target_name": "rfOff",
      "include_dirs": [ "<(module_root_dir)/server/app/util/cpp" ],
      "sources": [ "<(module_root_dir)/server/app/util/cpp/rfOff.cpp" ],
      "link_settings": { "libraries": [ "-lvisa64" ], "library_dirs" : [ "<(module_root_dir)/server/app/util/cpp" ] }
    },
    { 
      "target_name": "setPower",
      "include_dirs": [ "<(module_root_dir)/server/app/util/cpp" ],
      "sources": [ "<(module_root_dir)/server/app/util/cpp/setPower.cpp" ],
      "link_settings": { "libraries": [ "-lvisa64" ], "library_dirs" : [ "<(module_root_dir)/server/app/util/cpp" ] }
    },
    { 
      "target_name": "getPower",
      "include_dirs": [ "<(module_root_dir)/server/app/util/cpp" ],
      "sources": [ "<(module_root_dir)/server/app/util/cpp/getPower.cpp" ],
      "link_settings": { "libraries": [ "-lvisa64" ], "library_dirs" : [ "<(module_root_dir)/server/app/util/cpp" ] }
    },
    { 
      "target_name": "setAnalyzer",
      "include_dirs": [ "<(module_root_dir)/server/app/util/cpp" ],
      "sources": [ "<(module_root_dir)/server/app/util/cpp/setAnalyzer.cpp" ],
      "link_settings": { "libraries": [ "-lvisa64" ], "library_dirs" : [ "<(module_root_dir)/server/app/util/cpp" ] }
    },
    { 
      "target_name": "resetAnalyzer",
      "include_dirs": [ "<(module_root_dir)/server/app/util/cpp" ],
      "sources": [ "<(module_root_dir)/server/app/util/cpp/resetAnalyzer.cpp" ],
      "link_settings": { "libraries": [ "-lvisa64" ], "library_dirs" : [ "<(module_root_dir)/server/app/util/cpp" ] }
    }
  ]
}