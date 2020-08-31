using ArtefactDataModel.Property;
using System;
using System.Collections.Generic;
using System.Text;

namespace ArtefactDataModel.Interface
{
    public interface IAnnotation
    {
        List<Annotation> Annotations { get; set; }
    }
}
