#include <node.h>
#include "visa.h"

#include "stdio.h"

using namespace v8;

void getPower(const FunctionCallbackInfo<Value> &args)
{
    Isolate *isolate = args.GetIsolate();

    //* C++ starts here
    ViSession defaultRM, viMXA;
    ViStatus viStatus = 0;

    viStatus = viOpenDefaultRM(&defaultRM);
    viStatus = viOpen(defaultRM, "GPIB0::16::INSTR", VI_NULL, VI_NULL, &viMXA);

    if (viStatus)
    {
        printf("Could not open ViSession!\n");
        printf("Check instruments and connections\n");
        printf("\n");
        exit(0);
    }
    viPrintf(viMXA, "*RST\n"); // initializes signal generator
                               // prints to the output window
    printf("The signal generator should now be in REMOTE. The remote indicator\n");
    printf("annunciator R should appear on the signal generator display\n");
    printf("\n");

    viClose(viMXA);     // closes session
    viClose(defaultRM); // closes default session
    //* C++ ends here

    // args.GetReturnValue().Set(Number::New(isolate, power));
}

void init(Local<Object> exports, Local<Object> method)
{
    NODE_SET_METHOD(method, "exports", getPower);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, init);